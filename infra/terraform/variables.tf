variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "invest-forest-demo"
}

variable "region" {
  description = "GCP deployment region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "container_image" {
  description = "Backend container image URI in Artifact Registry"
  type        = string
  default     = "us-central1-docker.pkg.dev/invest-forest-demo/invest-forest-repo/server:latest"
}
