package transcriptionStorage

import (
	"../../service/transcriptions"
	"encoding/json"
	"github.com/prometheus/common/log"
	"net/http"
)

func GetTranscriptions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	email := r.URL.Query()["email"][0]
	if email == "" {
		w.WriteHeader(http.StatusInternalServerError)
		log.Error("Empty email was passed to delete user")
	}

	utranscriptions, err := transcriptions.GetTranscriptions(email)
	if err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	j, err := json.Marshal(utranscriptions)
	if err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	log.Info("Returning the following json " + string(j))
	//DemojsonRecord, _ := json.Marshal(domain.Transcription{
	//	Email:             "test@test.com",
	//	Title:             "Transcription",
	//	Preview:           "This is a preview",
	//	FullTranscription: "this is the full transcription",
	//	ContentFilePath:   "/filename.wav",
	//})

	w.Write(j)
}

func GetTranscription(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	title := r.URL.Query()["title"][0]
	if title == "" {
		w.WriteHeader(http.StatusInternalServerError)
		log.Error("Empty title was passed to delete user")
		return
	}

	transcription, err := transcriptions.GetTranscriptionByTitle(title)
	if err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	j, err := json.Marshal(transcription)
	if err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	log.Info(string(j))
	w.Write(j)
}

func DeleteTranscription(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

}
