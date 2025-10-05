package database

import (
	"easyblog/internal/config"
	"easyblog/internal/models"
	"errors"
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Initialize(cfg *config.Config) (*gorm.DB, error) {
	var (
		db  *gorm.DB
		err error
	)

	switch cfg.Database.Driver {
	case "postgres":
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s TimeZone=%s",
			cfg.Database.Host, cfg.Database.User, cfg.Database.Password, cfg.Database.DBName, cfg.Database.Port, cfg.Database.SSLMode, cfg.Database.Timezone,
		)
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	case "mysql":
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.Database.User, cfg.Database.Password, cfg.Database.Host, cfg.Database.Port, cfg.Database.DBName,
		)
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	case "sqlite", "sqlite3":
		path := cfg.Database.Path
		if path == "" {
			path = "easyblog.db"
		}
		db, err = gorm.Open(sqlite.Open(path), &gorm.Config{})
	default:
		return nil, fmt.Errorf("unsupported database driver: %s", cfg.Database.Driver)
	}

	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Tag{},
		&models.Post{},
		&models.Comment{},
		&models.ConfigModel{},
		&models.FriendsLink{},
	); err != nil {
		return nil, err
	}

	// initial
	if err = db.Where("role = ?", models.RoleAdmin).First(&models.User{}).Error; err != nil {
		if err = db.Create(&models.User{
			Username: "admin",
			Email:    "admin@easyblog.com",
			Password: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // admin
			Avatar:   "",
			Role:     "admin",
		}).Error; err != nil {
			return nil, err
		}
	}
	if err = db.Where("key = ?", "enable_register").First(&models.ConfigModel{}).Error; err != nil {
		if err = db.Create(&models.ConfigModel{
			Key:   "enable_register",
			Value: "false",
		}).Error; err != nil {
			return nil, err
		}
	}
	if err := db.Where("key = ?", "sites_name").First(&models.ConfigModel{}).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if err := db.Create(&models.ConfigModel{
				Key:   "sites_name",
				Value: "Easy Blog",
			}).Error; err != nil {
				return nil, err
			}
		}
	}

	return db, nil
}
