package main

import (
	"easyblog/internal/config"
	"easyblog/internal/database"
	"easyblog/internal/server"
	"log"
	"net/http"
)

func main() {
	// Load configuration
	appConfig, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// Initialize database
	db, err := database.Initialize(appConfig)
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}
	// db heart test
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql DB: %v", err)
	}
	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("database ping failed: %v", err)
	}

	// Setup HTTP server
	r := server.NewRouter(appConfig, db)
	srv := &http.Server{
		Addr:    appConfig.Server.Address,
		Handler: r,
	}

	log.Printf("easyblog backend listening on %s", appConfig.Server.Address)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}

}
