package posts

import (
	"easyblog/internal/models"
	"easyblog/internal/utils"
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"math"
	"net/http"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

type createPostRequest struct {
	Title       string `json:"title" binding:"required"`
	Content     string `json:"content" binding:"required"`
	Summary     string `json:"summary"`
	CoverImage  string `json:"cover_image"`
	CategoryIDs []uint `json:"category_ids"`
	TagIDs      []uint `json:"tag_ids"`
}

func (h *Handler) List(c *gin.Context) {
	var posts []models.Post
	q := h.db.Preload("Author").Preload("Categories").Preload("Tags")
	if k := c.Query("q"); k != "" {
		like := "%" + k + "%"
		q = q.Where("title LIKE ? OR summary LIKE ?", like, like)
	}
	page := utils.QueryInt(c, "page", 0, 0, math.MaxInt)
	size := utils.QueryInt(c, "size", 10, 1, 20)

	var total int64
	q.Model(&models.Post{}).Count(&total)
	if err := q.Limit(size).Offset(page * size).Order("created_at DESC").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"total": total, "items": posts})
}

func (h *Handler) Get(c *gin.Context) {
	var post models.Post
	if err := h.db.Preload("Author").Preload("Categories").Preload("Tags").First(&post, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	// increment view count
	h.db.Model(&post).UpdateColumn("view_count", gorm.Expr("view_count + 1"))
	c.JSON(http.StatusOK, post)
}

func (h *Handler) Create(c *gin.Context) {
	var req createPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// current user
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	user := userVal.(models.User)

	post := models.Post{Title: req.Title, Content: req.Content, Summary: req.Summary, CoverImage: req.CoverImage, AuthorID: user.ID}
	// associations
	if len(req.CategoryIDs) > 0 {
		var cats []models.Category
		h.db.Find(&cats, req.CategoryIDs)
		post.Categories = cats
	}
	if len(req.TagIDs) > 0 {
		var tags []models.Tag
		h.db.Find(&tags, req.TagIDs)
		post.Tags = tags
	}
	if err := h.db.Create(&post).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, post)
}

func (h *Handler) Update(c *gin.Context) {
	var post models.Post
	if err := h.db.First(&post, c.Param("id")).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		}
		return
	}

	var req createPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		post.Title = req.Title
		post.Content = req.Content
		post.Summary = req.Summary
		post.CoverImage = req.CoverImage

		if err := tx.Save(&post).Error; err != nil {
			return err
		}
		if len(req.CategoryIDs) > 0 {
			var cats []models.Category
			if err := tx.Find(&cats, req.CategoryIDs).Error; err != nil {
				return err
			}
			if len(cats) != len(req.CategoryIDs) {
				return errors.New("some category IDs are invalid")
			}
			if err := tx.Model(&post).Association("Categories").Replace(cats); err != nil {
				return err
			}
		} else {
			if err := tx.Model(&post).Association("Categories").Clear(); err != nil {
				return err
			}
		}
		if len(req.TagIDs) > 0 {
			var tags []models.Tag
			if err := tx.Find(&tags, req.TagIDs).Error; err != nil {
				return err
			}
			if len(tags) != len(req.TagIDs) {
				return errors.New("some tag IDs are invalid")
			}
			if err := tx.Model(&post).Association("Tags").Replace(tags); err != nil {
				return err
			}
		} else {
			if err := tx.Model(&post).Association("Tags").Clear(); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.db.Preload("Categories").Preload("Tags").First(&post, post.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load updated post"})
		return
	}
	c.JSON(http.StatusOK, post)
}

func (h *Handler) Delete(c *gin.Context) {
	if err := h.db.Delete(&models.Post{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.db.Where("post_id = ?", c.Param("id")).Delete(&models.Comment{}).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) Publish(c *gin.Context) {
	var post models.Post
	if err := h.db.First(&post, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	var body struct {
		Publish bool `json:"publish"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if body.Publish {
		post.Status = models.PostPublished
	} else {
		post.Status = models.PostDraft
	}
	if err := h.db.Save(&post).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, post)
}

func (h *Handler) GetPostsByCategory(c *gin.Context) {
	var category models.Category
	if err := h.db.First(&category, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
		return
	}
	var posts []models.Post
	err := h.db.Model(&category).
		Association("Posts").
		Find(&posts)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	for i := range posts {
		h.db.Preload("Categories").Preload("Tags").First(&posts[i], posts[i].ID)
	}
	c.JSON(http.StatusOK, posts)
}

func (h *Handler) GetPostsByTag(c *gin.Context) {
	tagID := c.Param("id")
	var posts []models.Post
	err := h.db.
		Joins("JOIN post_tags ON post_tags.post_id = posts.id").
		Where("post_tags.tag_id = ?", tagID).
		Preload("Categories").
		Preload("Tags").
		Find(&posts).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, posts)
}
