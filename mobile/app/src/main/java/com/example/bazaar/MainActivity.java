package com.example.bazaar;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.RelativeLayout;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Objects;

public class MainActivity extends AppCompatActivity {

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button menu = findViewById(R.id.button3);
        menu.setOnClickListener(view -> openMenu());

        Button login = findViewById(R.id.button);
        Button register = findViewById(R.id.button2);

        // Pobierz dane użytkownika z SharedPreferences
        SharedPreferences sharedPreferences = getSharedPreferences("auth_data", MODE_PRIVATE);
        String userData = sharedPreferences.getString("user", null);

        // Sprawdź, czy dane użytkownika są niepuste
        if (userData != null) {
            // Dane użytkownika istnieją, ukryj przyciski logowania i rejestracji
            login.setVisibility(View.GONE);
            register.setVisibility(View.GONE);
            menu.setText("Przejrzyj Kategorie");
            RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                    RelativeLayout.LayoutParams.WRAP_CONTENT,
                    RelativeLayout.LayoutParams.WRAP_CONTENT
            );
            layoutParams.addRule(RelativeLayout.BELOW, R.id.imageView); // Ustawia przycisk pod logo
            layoutParams.addRule(RelativeLayout.CENTER_HORIZONTAL); // Wyśrodkuj przycisk na osi poziomej
            menu.setLayoutParams(layoutParams);
        } else {
            // Dane użytkownika nie istnieją, pokaż przyciski logowania i rejestracji
            login.setVisibility(View.VISIBLE);
            register.setVisibility(View.VISIBLE);
        }

        // Dodaj nasłuchiwacze do przycisków logowania i rejestracji
        login.setOnClickListener(view -> login());
        register.setOnClickListener(view -> register());
    }

    @Override
    protected void onResume() {
        super.onResume();
        Button menu = findViewById(R.id.button3);
        menu.setOnClickListener(view -> openMenu());

        Button login = findViewById(R.id.button);
        Button register = findViewById(R.id.button2);

        // Pobierz dane użytkownika z SharedPreferences
        SharedPreferences sharedPreferences = getSharedPreferences("auth_data", MODE_PRIVATE);
        String userData = sharedPreferences.getString("user", null);

        // Sprawdź, czy dane użytkownika są niepuste
        if (userData != null) {
            // Dane użytkownika istnieją, ukryj przyciski logowania i rejestracji
            login.setVisibility(View.GONE);
            register.setVisibility(View.GONE);
            menu.setText("Przejrzyj Kategorie");
            RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                    RelativeLayout.LayoutParams.WRAP_CONTENT,
                    RelativeLayout.LayoutParams.WRAP_CONTENT
            );
            layoutParams.addRule(RelativeLayout.BELOW, R.id.imageView); // Ustawia przycisk pod logo
            layoutParams.addRule(RelativeLayout.CENTER_HORIZONTAL); // Wyśrodkuj przycisk na osi poziomej
            menu.setLayoutParams(layoutParams);
        } else {
            // Dane użytkownika nie istnieją, pokaż przyciski logowania i rejestracji
            login.setVisibility(View.VISIBLE);
            register.setVisibility(View.VISIBLE);
        }

        // Dodaj nasłuchiwacze do przycisków logowania i rejestracji
        login.setOnClickListener(view -> login());
        register.setOnClickListener(view -> register());
    }

    private void openMenu() {
        Intent intent = new Intent(this, Menu.class);
        startActivity(intent);
    }

    private void login(){
        Intent intent = new Intent(this, Login.class);
        startActivity(intent);
    }

    private void register(){
        Intent intent = new Intent(this, Register.class);
        startActivity(intent);
    }
}