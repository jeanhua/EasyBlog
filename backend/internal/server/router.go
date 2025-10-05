package server

import (
	"easyblog/internal/controllers/categories"
	"easyblog/internal/controllers/friendslink"
	"easyblog/internal/controllers/tags"
	"net/http"

	"easyblog/internal/config"
	"easyblog/internal/controllers/auth"
	"easyblog/internal/controllers/comments"
	cfghandler "easyblog/internal/controllers/config"
	"easyblog/internal/controllers/posts"
	mw "easyblog/internal/server/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewRouter(cfg *config.Config, db *gorm.DB) *gin.Engine {
	r := gin.Default()
	r.Use(mw.WithDeps(cfg, db))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		// auth routes
		authGroup := api.Group("/auth")
		{
			authHandler := auth.NewHandler(db, cfg)
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
			authGroup.GET("/profile", mw.JWT(cfg), authHandler.Profile)
		}

		// category routes
		categoriesGroup := api.Group("/categories")
		{
			categoriesHandler := categories.NewHandler(db, cfg)
			categoriesGroup.GET("/", categoriesHandler.List)
			categoriesGroup.Use(mw.JWT(cfg))
			categoriesGroup.POST("/:id", categoriesHandler.Create)
			categoriesGroup.DELETE("/:id", categoriesHandler.Delete)
			categoriesGroup.PUT("/:id", categoriesHandler.Update)
		}

		// tag routes
		tagsGroup := api.Group("/tags")
		{
			tagsHandler := tags.NewHandler(db, cfg)
			tagsGroup.GET("/", tagsHandler.List)
			tagsGroup.Use(mw.JWT(cfg))
			tagsGroup.POST("", tagsHandler.Create)
			tagsGroup.DELETE("/:id", tagsHandler.Delete)
			tagsGroup.PUT("/:id", tagsHandler.Update)
		}

		// posts routes
		postsGroup := api.Group("/posts")
		{
			postsHandler := posts.NewHandler(db)
			postsGroup.GET("", postsHandler.List)
			postsGroup.GET("/:id", postsHandler.Get)
			postsGroup.GET("/category/:id", postsHandler.GetPostsByCategory)
			postsGroup.GET("/tag/:id", postsHandler.GetPostsByTag)
			postsGroup.Use(mw.JWT(cfg))
			postsGroup.POST("", postsHandler.Create)
			postsGroup.PUT("/:id", postsHandler.Update)
			postsGroup.DELETE("/:id", postsHandler.Delete)
			postsGroup.PUT("/:id/publish", postsHandler.Publish)
		}

		// friends link
		friendsGroup := api.Group("/friends")
		{
			friendsHandler := friendslink.NewHandler(db)
			friendsGroup.GET("", friendsHandler.List)
			friendsGroup.Use(mw.JWT(cfg))
			friendsGroup.POST("", friendsHandler.Create)
			friendsGroup.PUT("/:id", friendsHandler.Update)
			friendsGroup.DELETE("/:id", friendsHandler.Delete)
		}

		// comments routes
		cmHandler := comments.NewHandler(db)
		api.GET("/posts/:id/comments", cmHandler.ListByPost)
		api.POST("/comments", mw.JWT(cfg), cmHandler.Create)
		api.DELETE("/comments/:id", mw.JWT(cfg), cmHandler.Delete)

		// config routes
		configGroup := api.Group("/config")
		{
			configHandler := cfghandler.NewHandler(db)
			configGroup.GET("", configHandler.Get)
			configGroup.Use(mw.JWT(cfg))
			configGroup.GET("/all", configHandler.List)
			configGroup.POST("", configHandler.Create)
			configGroup.PUT("", configHandler.Update)
			configGroup.DELETE("", configHandler.Delete)
		}
	}

	return r
}
