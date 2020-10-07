package main

import (
	userAuthController "./controller/UserAuthentication"
	userAuthService "./service/userAuth"
	"github.com/gorilla/handlers"

	deepSpeechController "./controller/deepSpeech"
	transcriptionStorageController "./controller/transcriptionStorage"
	transcriptionService "./service/transcriptions"
	"github.com/prometheus/common/log"
	"net/http"
)

func main() {

	userAuthService.InitDatabaseConn() //database connection steps take 10 seconds as mysql needs time to init
	transcriptionService.InitTranscriptionDBConn()

	log.Info("Setting Service Up On Port 1177")
	mux := http.DefaultServeMux

	//userAuthController API
	mux.HandleFunc("/userauth/register/new", userAuthController.RegisterUser)
	mux.HandleFunc("/userauth/register/check", userAuthController.CheckUser)
	mux.HandleFunc("/userauth/register/delete", userAuthController.DeleteRegisteredUser)
	mux.HandleFunc("/userauth/register/login", userAuthController.LoginUser)

	//Transcription Storage API
	mux.HandleFunc("/transcriptions/get/all", transcriptionStorageController.GetTranscriptions)
	mux.HandleFunc("/transcriptions/get/single", transcriptionStorageController.GetTranscription)
	mux.HandleFunc("/transcriptions/delete", transcriptionStorageController.DeleteTranscription)
	mux.HandleFunc("/transcriptions/update", transcriptionStorageController.UpdateTranscription)
	mux.HandleFunc("/transcriptions/count", transcriptionStorageController.GetUserTranscriptionCount)
	mux.HandleFunc("/transcriptions/get/pending", transcriptionStorageController.GetPendingTranscriptions)
	//deepSpeech API
	mux.HandleFunc("/deepSpeech/media/upload", deepSpeechController.UploadMedia)
	mux.HandleFunc("/deepSpeech/media/delete", deepSpeechController.DeleteMedia)
	mux.HandleFunc("/deepSpeech/media/get", deepSpeechController.GetMedia)

	//uses old school gorilla package to handle CORS
	headers := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}) //only allowed headers
	methods := handlers.AllowedMethods([]string{"GET", "POST"})                                       //only allowed requests
	origins := handlers.AllowedOrigins([]string{"*"})                                                 //any possible domain origin

	log.Info("Service Up On Port 1177")
	log.Info(http.ListenAndServe(":1177", handlers.CORS(headers, methods, origins)(mux)))
}
