module "service_account_calendarmanagement-service" {
  source       = "./modules/service_account"
  account_id   = "calendarmanagement-service"
  display_name = "Calendar Management Service Account"
  project_id   = "intricate-pad-455413-f7"
  roles        = [
    "roles/cloudsql.client",
    "roles/secretmanager.secretAccessor",
    "roles/artifactregistry.reader"
  ]
}