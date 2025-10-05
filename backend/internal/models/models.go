package models

import (
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleUser  UserRole = "user"
	RoleAdmin UserRole = "admin"
)

type User struct {
	gorm.Model
	Username string   `gorm:"uniqueIndex;size:64" json:"username"`
	Email    string   `gorm:"uniqueIndex;size:128" json:"email"`
	Password string   `json:"-"`
	Avatar   string   `json:"avatar"`
	Role     UserRole `gorm:"size:16;default:user" json:"role"`
}

type Category struct {
	gorm.Model
	Name        string `gorm:"uniqueIndex;size:64" json:"name"`
	Description string `gorm:"size:255" json:"description"`
}

type Tag struct {
	gorm.Model
	Name string `gorm:"uniqueIndex;size:64" json:"name"`
}

type PostStatus string

const (
	PostDraft     PostStatus = "draft"
	PostPublished PostStatus = "published"
)

type Post struct {
	gorm.Model
	Title      string     `gorm:"size:200" json:"title"`
	Content    string     `gorm:"type:text" json:"content"`
	Summary    string     `gorm:"size:500" json:"summary"`
	CoverImage string     `json:"cover_image"`
	AuthorID   uint       `json:"author_id"`
	Author     *User      `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	Status     PostStatus `gorm:"size:16;default:draft" json:"status"`
	ViewCount  uint       `json:"view_count"`
	Categories []Category `gorm:"many2many:post_categories;" json:"categories,omitempty"`
	Tags       []Tag      `gorm:"many2many:post_tags;" json:"tags,omitempty"`
}

type Comment struct {
	gorm.Model
	PostID  uint   `json:"post_id"`
	UserID  uint   `json:"user_id"`
	Content string `gorm:"type:text" json:"content"`
}

type FriendsLink struct {
	gorm.Model
	Title       string `gorm:"size:128" json:"title"`
	Avatar      string `gorm:"size:255" json:"avatar"`
	Description string `gorm:"size:255" json:"description"`
	Link        string `gorm:"size:255" json:"link"`
}
