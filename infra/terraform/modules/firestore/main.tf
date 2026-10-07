variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region for Firestore"
  type        = string
}

resource "google_firestore_database" "database" {
  project                 = var.project_id
  name                    = "(default)"
  location_id             = var.region
  type                    = "FIRESTORE_NATIVE"
  concurrency_mode        = "OPTIMISTIC"
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
}

output "database_id" {
  description = "Firestore Database ID"
  value       = google_firestore_database.database.id
}

output "database_name" {
  description = "Firestore Database Name"
  value       = google_firestore_database.database.name
}
