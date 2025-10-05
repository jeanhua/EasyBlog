package friendslink

import (
	"easyblog/internal/models"
	"easyblog/internal/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"math"
	"net/http"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) *Handler { return &Handler{db: db} }

func (h *Handler) List(c *gin.Context) {
	var friends []models.FriendsLink
	page := utils.QueryInt(c, "page", 0, 0, math.MaxInt)
	size := utils.QueryInt(c, "size", 10, 1, 20)
	var total int64
	h.db.Model(&models.FriendsLink{}).Count(&total)
	if err := h.db.Limit(size).Offset(page * size).Find(&friends).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": friends, "total": total})
}

type createFriendReq struct {
	Title       string `json:"title"`
	Link        string `json:"link"`
	Avatar      string `json:"avatar"`
	Description string `json:"description"`
}

func (h *Handler) Create(c *gin.Context) {
	var req createFriendReq
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

	if user.Role != models.RoleAdmin {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you are not admin"})
		return
	}

	friendsLink := models.FriendsLink{
		Title:       req.Title,
		Link:        req.Link,
		Avatar:      req.Avatar,
		Description: req.Description,
	}

	if err := h.db.Create(&friendsLink).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
}

type updateFriendReq struct {
	Title       string `json:"title"`
	Link        string `json:"link"`
	Avatar      string `json:"avatar"`
	Description string `json:"description"`
}

func (h *Handler) Update(c *gin.Context) {
	var req updateFriendReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var resu models.FriendsLink
	if err := h.db.First(&resu, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	resu.Title = req.Title
	resu.Link = req.Link
	resu.Description = req.Description
	resu.Avatar = req.Avatar

	if err := h.db.Save(&resu).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, resu)
}

func (h *Handler) Delete(c *gin.Context) {
	var resu models.FriendsLink
	if err := h.db.Delete(&resu, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": "ok"})
}
