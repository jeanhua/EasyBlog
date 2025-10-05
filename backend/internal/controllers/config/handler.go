package config

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

func (h *Handler) List(c *gin.Context) {
	var cfgs []models.ConfigModel
	page := utils.QueryInt(c, "page", 0, 0, math.MaxInt)
	size := utils.QueryInt(c, "size", 10, 1, 20)
	var total int64
	h.db.Model(&models.ConfigModel{}).Count(&total)
	if err := h.db.Limit(size).Offset(page * size).Find(&cfgs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": cfgs, "total": total, "page": page, "size": size})
}

type createConfigReq struct {
	Key   string `json:"key" binding:"required"`
	Value string `json:"value" binding:"required"`
}

func (h *Handler) Create(c *gin.Context) {
	var req createConfigReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var count int64
	h.db.Model(&models.ConfigModel{}).Where("key = ?", req.Key).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key already exists"})
		return
	}

	if err := h.db.Create(&models.ConfigModel{Key: req.Key, Value: req.Value}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": "ok"})
}

type updateConfigReq struct {
	Value string `json:"value" binding:"required"`
}

func (h *Handler) Update(c *gin.Context) {
	key := c.Query("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key is required"})
		return
	}

	var req updateConfigReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var cfg models.ConfigModel
	if err := h.db.Where("key = ?", key).First(&cfg).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "config not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	cfg.Value = req.Value
	if err := h.db.Save(&cfg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"result": "ok"})
}

func (h *Handler) Get(c *gin.Context) {
	key := c.Query("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key is required"})
		return
	}

	var cfg models.ConfigModel
	if err := h.db.Where("key = ?", key).First(&cfg).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "config not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": cfg})
}

func (h *Handler) Delete(c *gin.Context) {
	key := c.Query("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key is required"})
		return
	}

	var cfg models.ConfigModel
	if err := h.db.Where("key = ?", key).First(&cfg).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "config not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Delete(&cfg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"result": "ok"})
}
