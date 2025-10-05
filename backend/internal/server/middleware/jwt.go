package middleware

import (
    "net/http"
    "strings"

    "easyblog/internal/config"
    "easyblog/internal/models"
    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "gorm.io/gorm"
)

func JWT(cfg *config.Config) gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if !strings.HasPrefix(authHeader, "Bearer ") {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
            return
        }
        tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
        token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
            return []byte(cfg.Server.JWT.Secret), nil
        })
        if err != nil || !token.Valid {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
            return
        }
        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
            return
        }
        // Load user if DB is available from context
        if dbVal, exists := c.Get("db"); exists {
            if db, ok := dbVal.(*gorm.DB); ok {
                var user models.User
                if err := db.First(&user, claims["sub"]).Error; err == nil {
                    c.Set("user", user)
                }
            }
        }
        c.Next()
    }
}


