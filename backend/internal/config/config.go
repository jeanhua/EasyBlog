package config

import (
	"fmt"

	"github.com/spf13/viper"
)

type ServerConfig struct {
	Address string `mapstructure:"address"`
	JWT     struct {
		Secret     string `mapstructure:"secret"`
		ExpireHour int    `mapstructure:"expire_hour"`
	} `mapstructure:"jwt"`
}

type DatabaseConfig struct {
	Driver   string `mapstructure:"driver"` // postgres 、 mysql
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DBName   string `mapstructure:"dbname"`
	Path     string `mapstructure:"path"`    // for sqlite file path
	SSLMode  string `mapstructure:"sslmode"` // for postgres
	Timezone string `mapstructure:"timezone"`
}

type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
}

func Load() (*Config, error) {
	v := viper.New()
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.AddConfigPath("./config")
	v.AddConfigPath("../../config")

	// Defaults
	v.SetDefault("server.address", ":7966")
	v.SetDefault("server.jwt.expire_hour", 72)
	v.SetDefault("database.driver", "sqlite")
	v.SetDefault("database.host", "127.0.0.1")
	v.SetDefault("database.port", 5432)
	v.SetDefault("database.user", "postgres")
	v.SetDefault("database.password", "postgres")
	v.SetDefault("database.dbname", "easyblog")
	v.SetDefault("database.path", "easyblog.db")
	v.SetDefault("database.sslmode", "disable")
	v.SetDefault("database.timezone", "Asia/Shanghai")

	// Environment overrides
	v.SetEnvPrefix("EASYBLOG")
	v.AutomaticEnv()

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("read config: %w", err)
		}
	}

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshal config: %w", err)
	}
	return &cfg, nil
}
