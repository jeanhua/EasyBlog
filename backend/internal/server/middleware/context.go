package middleware

import (
    "easyblog/internal/config"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

// Injects common dependencies into request context
func WithDeps(cfg *config.Config, db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Set("cfg", cfg)
        c.Set("db", db)
        c.Next()
    }
}


