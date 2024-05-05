package com.example.bazaar;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.JsonRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Objects;

public class Profile extends AppCompatActivity {

    private static final String TAG = Profile.class.getSimpleName();
    private static final String ApiGateway = "http://10.0.2.2:8000"; // Zmień na rzeczywisty URL bazy API

    // Dane użytkownika
    private JSONObject userData;
    private JSONObject displayNames;
    SharedPreferences sharedPreferences;

    Button showForm, hideForm, submit;
    LinearLayout changeDataForm;
    // Pola formularza
    private EditText inputName, inputEmail, inputPhone, inputCity, inputPostalCode, inputStreet, inputStreetNumber, inputWebsite;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        // Inicjalizacja pól formularza
        inputName = findViewById(R.id.inputName);
        inputEmail = findViewById(R.id.inputEmail);
        inputPhone = findViewById(R.id.inputPhone);
        inputCity = findViewById(R.id.inputCity);
        inputPostalCode = findViewById(R.id.inputPostalCode);
        inputStreet = findViewById(R.id.inputStreet);
        inputStreetNumber = findViewById(R.id.inputStreetNumber);
        inputWebsite = findViewById(R.id.inputWebsite);
        sharedPreferences = getSharedPreferences("auth_data", Context.MODE_PRIVATE);
        changeDataForm = findViewById(R.id.changeDataForm);
        showForm = findViewById(R.id.showFormButton);
        hideForm = findViewById(R.id.hideFormButton);
        submit = findViewById(R.id.submitButton);
        renderData();
        showForm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
               changeDataForm.setVisibility(View.VISIBLE);
            }
        });
        hideForm.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                changeDataForm.setVisibility(View.INVISIBLE);
            }
        });
        submit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                changeData();
            }
        });
    }

    // Pobieranie danych użytkownika
    private void renderData() {
        // Pobieranie danych użytkownika z lokalnego przechowywania
        try {
            JSONObject userDataFromStorage = new JSONObject(Objects.requireNonNull(sharedPreferences.getString("user","")));
            String userID = userDataFromStorage.getString("id");
            getUserData(userID);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    // Wyświetlanie danych użytkownika
    private void displayUserData(JSONObject userData) {
        try {
            inputName.setText(userData.getString("name"));
            inputEmail.setText(userData.getString("email"));
            inputPhone.setText(userData.getString("phone"));
            inputCity.setText(userData.getString("city"));
            inputPostalCode.setText(userData.getString("postal_code"));
            inputStreet.setText(userData.getString("street"));
            inputStreetNumber.setText(userData.getString("street_number"));
            inputWebsite.setText(userData.getString("website"));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    // Pobieranie danych użytkownika z serwera
    private void getUserData(String userId) {
        String url = ApiGateway + "/get_user/" + userId;
        JsonArrayRequest jsonArrayRequest = new JsonArrayRequest
                (Request.Method.GET, url, null, response -> {
                    try {
                        // Przetwarzanie tablicy JSON
                        for (int i = 0; i < response.length(); i++) {
                            JSONObject userData = response.getJSONObject(i);
                            // Wyświetlenie danych użytkownika
                            Log.d("user Data", userData.toString());
                            displayUserData(userData);
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                        Toast.makeText(Profile.this, "Wystąpił problem podczas przetwarzania danych użytkownika.", Toast.LENGTH_SHORT).show();
                    }
                }, error -> {
                    Log.e(TAG, "Błąd: " + error.toString());
                    Toast.makeText(Profile.this, "Wystąpił problem podczas pobierania danych użytkownika.", Toast.LENGTH_SHORT).show();
                });

        // Dodanie żądania do kolejki Volley
        RequestQueue requestQueue = Volley.newRequestQueue(this);
        requestQueue.add(jsonArrayRequest);
    }


    // Walidacja formularza
    private boolean validateForm() {
        String name = inputName.getText().toString();
        String email = inputEmail.getText().toString();
        String phone = inputPhone.getText().toString();
        String city = inputCity.getText().toString();
        String postalCode = inputPostalCode.getText().toString();
        String street = inputStreet.getText().toString();
        String streetNumber = inputStreetNumber.getText().toString();
        String website = inputWebsite.getText().toString();

        // Prosta walidacja danych
        if (name.isEmpty() || email.isEmpty() || phone.isEmpty() || city.isEmpty() || postalCode.isEmpty() || street.isEmpty() || streetNumber.isEmpty()) {
            Toast.makeText(this, "Wszystkie pola są wymagane", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (!validateEmail(email)) {
            Toast.makeText(this, "Nieprawidłowy adres email", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (!validatePhone(phone)) {
            Toast.makeText(this, "Nieprawidłowy numer telefonu (oczekiwany format: 123-456-789)", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (!validatePostalCode(postalCode)) {
            Toast.makeText(this, "Nieprawidłowy kod pocztowy (oczekiwany format: 12345)", Toast.LENGTH_SHORT).show();
            return false;
        }

        if (!validateStreetNumber(streetNumber)) {
            Toast.makeText(this, "Nieprawidłowy numer domu", Toast.LENGTH_SHORT).show();
            return false;
        }

        return true;
    }

    // Walidacja adresu email
    private boolean validateEmail(String email) {
        String emailPattern = "[a-zA-Z0-9._-]+@[a-z]+\\.+[a-z]+";
        return email.matches(emailPattern);
    }

    // Walidacja numeru telefonu
    private boolean validatePhone(String phone) {
        String phonePattern = "\\d{3}-\\d{3}-\\d{3}";
        return phone.matches(phonePattern);
    }

    // Walidacja kodu pocztowego
    private boolean validatePostalCode(String postalCode) {
        String postalCodePattern = "\\d{5}";
        return postalCode.matches(postalCodePattern);
    }

    // Walidacja numeru domu
    private boolean validateStreetNumber(String streetNumber) {
        String streetNumberPattern = "\\d+";
        return streetNumber.matches(streetNumberPattern);
    }

    // Obsługa zdarzenia zmiany danych
    private void changeData() {
        // Pobieranie danych z pól formularza
        String name = inputName.getText().toString();
        String email = inputEmail.getText().toString();
        String phone = inputPhone.getText().toString();
        String city = inputCity.getText().toString();
        String postalCode = inputPostalCode.getText().toString();
        String street = inputStreet.getText().toString();
        String streetNumber = inputStreetNumber.getText().toString();
        String website = inputWebsite.getText().toString();

        // Walidacja formularza
        if (!validateForm()) {
            return;
        }

        // Przygotowanie danych do wysłania na serwer
        JSONObject data = new JSONObject();
        try {
            data.put("id", new JSONObject(Objects.requireNonNull(sharedPreferences.getString("user",""))).getString("id"));
            data.put("name", name);
            data.put("email", email);
            data.put("phone", phone);
            data.put("city", city);
            data.put("postal_code", postalCode);
            data.put("street", street);
            data.put("street_number", streetNumber);
            data.put("website", website);
            Log.d("change", data.toString());
        } catch (JSONException e) {
            e.printStackTrace();
        }

        // Wysłanie danych na serwer metodą PUT
        String url = ApiGateway + "/update_user";
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest
                (Request.Method.PUT, url, data, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Log.d(TAG, "Zaktualizowane dane użytkownika: " + response.toString());
                        renderData();
                        displaySuccessMessage();
                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.e(TAG, "Błąd: " + error.toString());
                        Toast.makeText(Profile.this, "Wystąpił błąd podczas aktualizacji danych użytkownika.", Toast.LENGTH_SHORT).show();
                    }
                });

        // Dodanie żądania do kolejki Volley
        RequestQueue requestQueue = Volley.newRequestQueue(this);
        requestQueue.add(jsonObjectRequest);
    }

    // Wyświetlanie komunikatu o sukcesie
    private void displaySuccessMessage() {
        Toast.makeText(this, "Dane użytkownika zostały zaktualizowane.", Toast.LENGTH_SHORT).show();
    }

    // Ukrywanie komunikatu
    private void closeMessage() {
        // Do nothing or add specific functionality if needed
    }

    // Inne metody pomocnicze związane z walidacją i obsługą danych użytkownika
}
