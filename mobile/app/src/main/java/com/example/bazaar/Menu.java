package com.example.bazaar;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;

import java.util.Objects;

public class Menu extends AppCompatActivity {

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_menu);
        String url = "http://10.0.2.2:8000/categories";
        JSONArray categories = new JSONArray();
        Log.d("lol","lol");
        JsonArrayRequest request = new JsonArrayRequest(Request.Method.GET, url, null, jsonArray -> {
            // Tutaj uzyskaj dostęp do JSONArray i jego długości
            int arraySize = jsonArray.length();

            // Tworzenie kontenera LinearLayout, który będzie zawierał guziki
            LinearLayout linearLayout = findViewById(R.id.CategoriesContainer);

            // Tworzenie guzików zależnie od długości JSONArray
            for (int i = 0; i < arraySize; i++) {
                final int buttonId = i; // Zmienna lokalna musi być efektywnie finalna
                Button button = new Button(this);
                try {
                    button.setText(jsonArray.getJSONObject(i).getString("name"));
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
                LinearLayout.LayoutParams buttonLayoutParams = new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT
                );

                buttonLayoutParams.bottomMargin = 16; // Ustaw margines dolny w pikselach
                button.setLayoutParams(buttonLayoutParams);
                button.setId(i); // Ustaw unikalne ID dla każdego guzika
                button.setBackgroundColor(getResources().getColor(R.color.button));
                button.setTextColor(Color.WHITE);

                button.setOnClickListener(v -> {
                    // Obsługa kliknięcia guzika
                    // Możemy korzystać z 'buttonId' i 'categories', ponieważ są to efektywnie finalne zmienne lokalne
                    Toast.makeText(getApplicationContext(), "Button " + buttonId + " clicked. Category: " + categories.optJSONObject(buttonId).optString("name"), Toast.LENGTH_SHORT).show();
                });

                // Dodanie guzika do kontenera ScrollView
                linearLayout.addView(button);
            }

            Log.d("Response", jsonArray.toString());
        }, volleyError -> Log.d("Error", Objects.requireNonNull(volleyError.getMessage())));
        Volley.newRequestQueue(this).add(request);

    }
}
