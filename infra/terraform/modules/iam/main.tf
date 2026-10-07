variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "account_id" {
  description = "Service account ID"
  type        = string
  default     = "invest-forest-sa"
}

resource "google_service_account" "sa" {
  project      = var.project_id
  account_id   = var.account_id
  display_name = "Invest Forest Service Account"
}

resource "google_project_iam_member" "log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.sa.email}"
}

resource "google_project_iam_member" "firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.sa.email}"
}

output "service_account_email" {
  description = "Email of the service account"
  value       = google_service_account.sa.email
}
