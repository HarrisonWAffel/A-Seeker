package deepSpeech

import (
	"fmt"
	"github.com/prometheus/common/log"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"
)

//GetMedia will call the DeepSpeech service API to retrieve a media file, specified by filename.
//the results will be returned as a byte array.
func GetMedia(w http.ResponseWriter, fileName string) []byte {
	log.Info("http://deepspeech:5000/get/" + fileName)
	req, err := http.NewRequest(http.MethodGet, "http://deepspeech:5000/get/"+fileName, nil)
	if NetworkErr(w, err) {
		return nil
	}
	resp, err := http.DefaultClient.Do(req)
	if NetworkErr(w, err) {
		return nil
	}
	b, err := ioutil.ReadAll(resp.Body)
	if NetworkErr(w, err) {
		return nil
	}
	resp.Body.Close()
	return b
}

//UploadMediaAsFile will accept a multipart file, and a file name. It will then POST to the
//DeepSpeech API, which will start the ASR processing.
func UploadMediaAsFile(w http.ResponseWriter, file multipart.File, fileName string, threadCount string) *http.Response {
	log.Info("Sending an upload")
	threadNum, err := strconv.Atoi(strings.Replace(threadCount, "'", "", -1))
	if NetworkErr(w, err) {
		return &http.Response{}
	}


	log.Info(fmt.Sprintf("http://deepspeech:5000/upload/%s/%d",fileName, threadNum))
	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("http://deepspeech:5000/upload/%s/%d",fileName, threadNum), file)
	if NetworkErr(w, err) {
		return &http.Response{}
	}


	resp, err := http.DefaultClient.Do(req)
	if NetworkErr(w, err) {
		return &http.Response{}
	}
	log.Info("Upload Sent")
	return resp
}

//NetworkErr is a utility function that accepts an error and a response writer.
//If an error is found, the response writer automatically writes status 500 and returns false.
func NetworkErr(w http.ResponseWriter, err error) bool {
	if err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusInternalServerError)
		return true
	}
	return false
}
