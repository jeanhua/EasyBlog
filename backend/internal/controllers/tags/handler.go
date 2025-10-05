package tags

import (
	"easyblog/internal/config"
	"easyblog/internal/models"
	"easyblog/internal/utils"
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"math"
	"net/http"
)

type Handler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewHandler(db *gorm.DB, cfg *config.Config) *Handler {
	return &Handler{db: db, cfg: cfg}
}

type TagWithCount struct {
	models.Tag
	PostCount int `json:"post_count"`
}

func (h *Handler) List(c *gin.Context) {
	page := utils.QueryInt(c, "page", 0, 0, math.MaxInt)
	size := utils.QueryInt(c, "size", 10, 1, 20)
	var total int64
	h.db.Model(&models.Tag{}).Count(&total)
	var tags []TagWithCount
	err := h.db.Model(&models.Tag{}).
		Select("tags.*, COUNT(post_tags.post_id) as post_count").
		Joins("LEFT JOIN post_tags ON post_tags.tag_id = tags.id").
		Group("tags.id").
		Limit(size).
		Offset(page * size).
		Scan(&tags).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": tags, "total": total})
}

type createTagReq struct {
	Name string `json:"name" binding:"required"`
}

func (h *Handler) Create(c *gin.Context) {
	var req createTagReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}
	if err := h.db.Create(&models.Tag{Name: req.Name}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": "ok"})
}

type updateTagReq struct {
	Name string `json:"name"`
}

func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	var req updateTagReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var tag models.Tag
	if err := h.db.First(&tag, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "tag not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}

	if len(updates) > 0 {
		if err := h.db.Model(&tag).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"result": "ok"})
}

func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	var tag models.Tag
	if err := h.db.First(&tag, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "tag not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Delete(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": "ok"})
}
