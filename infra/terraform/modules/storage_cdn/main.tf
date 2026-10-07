variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
}

variable "bucket_name" {
  description = "Unique GCS bucket name for hosting web frontend"
  type        = string
}

resource "google_storage_bucket" "web_bucket" {
  name                        = var.bucket_name
  project                     = var.project_id
  location                    = var.region
  force_destroy               = true
  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "OPTIONS"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.web_bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_compute_backend_bucket" "cdn_backend" {
  project     = var.project_id
  name        = "${var.bucket_name}-cdn-backend"
  bucket_name = google_storage_bucket.web_bucket.name
  enable_cdn  = true
  description = "Cloud CDN backend bucket for Invest Forest static web assets"

  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    default_ttl       = 3600
    client_ttl        = 3600
    max_ttl           = 86400
    negative_caching  = true
    serve_while_stale = 86400
  }
}

output "bucket_name" {
  description = "GCS static web bucket name"
  value       = google_storage_bucket.web_bucket.name
}

output "bucket_url" {
  description = "GCS bucket URL"
  value       = google_storage_bucket.web_bucket.url
}

output "backend_bucket_id" {
  description = "Cloud CDN Backend Bucket ID"
  value       = google_compute_backend_bucket.cdn_backend.id
}
