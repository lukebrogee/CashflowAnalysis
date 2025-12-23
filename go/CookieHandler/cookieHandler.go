package cookies

import (
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
)

// Explanation on cookie encryption and signing
// This code demonstrates how to securely handle cookies in Go by using encryption and signing techniques.
// The main goals are to protect the confidentiality and integrity of cookie data, preventing tampering and unauthorized access.
/*https://www.alexedwards.net/blog/working-with-cookies-in-go*/

var (
	ErrValueTooLong = errors.New("cookie value too long")
	ErrInvalidValue = errors.New("invalid cookie value")
	secretKey       []byte
)

func testSetCookie(cookieName string, cookieValue string, cookieAge int) {
	// 1) Simulate a client calling the setCookieHandler to receive a Set-Cookie header
	rec := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	setCookieHandler(rec, req, cookieName, cookieValue, cookieAge)
	res := rec.Result()
	defer res.Body.Close()

	// Print Set-Cookie headers
	fmt.Println("Set-Cookie headers:", res.Header.Values("Set-Cookie"))

	// Extract cookies written by the handler
	cookies := res.Cookies()
	fmt.Printf("Cookies written: %d\n", len(cookies))
	for _, c := range cookies {
		fmt.Printf(" - %s=%s\n", c.Name, c.Value)
	}
}

func testGetCookie(cookieName string) {
	// 1) Simulate a client calling the getCookieHandler with a cookie
	rec := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)

	getCookieHandler(rec, req, cookieName)
	res := rec.Result()
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println("getCookieHandler response body:", string(body))
}

func setCookieHandler(w http.ResponseWriter, r *http.Request, cookieName string, cookieValue string, cookieAge int) error {

	SetSecretKeyFromHex()

	cookie := http.Cookie{
		Name:     cookieName,
		Value:    cookieValue,
		Path:     "/",
		MaxAge:   cookieAge,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	}

	err := WriteEncrypted(w, cookie, secretKey)
	if err != nil {
		log.Println(err)
		http.Error(w, "server error", http.StatusInternalServerError)
		return err
	}

	w.Write([]byte("cookie set!"))
	return nil
}

func getCookieHandler(w http.ResponseWriter, r *http.Request, cookieName string) (string, error) {
	value, err := ReadEncrypted(r, cookieName, secretKey)
	if err != nil {
		switch {
		case errors.Is(err, http.ErrNoCookie):
			http.Error(w, "cookie not found", http.StatusBadRequest)
		case errors.Is(err, ErrInvalidValue):
			http.Error(w, "invalid cookie", http.StatusBadRequest)
		default:
			log.Println(err)
			http.Error(w, "server error", http.StatusInternalServerError)
		}
		return "", err
	}

	w.Write([]byte(value))
	return value, nil
}

// SetSecretKeyFromHex initializes the package secretKey from a hex-encoded string.
// Call this during program startup (or in tests) before using the helpers.
func SetSecretKeyFromHex() error {
	var err error
	secretKey, err = hex.DecodeString("13d6b4dff8f84a10851021ec8608f814570d562c92fe6b5ec4c9f595bcb3234b")
	if err != nil {
		return err
	}

	return nil
}
