package models

import "gorm.io/gorm"

type ConfigModel struct {
	gorm.Model
	Key   string `gorm:"unique"`
	Value string `gorm:"size:255"`
}
