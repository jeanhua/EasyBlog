package utils

import (
	"github.com/gin-gonic/gin"
	"strconv"
)

func QueryInt(c *gin.Context, key string, defaultValue, min, max int) int {
	result, _ := strconv.Atoi(c.DefaultQuery(key, strconv.Itoa(defaultValue)))
	if result < min || result > max {
		result = defaultValue
	}
	return result
}
