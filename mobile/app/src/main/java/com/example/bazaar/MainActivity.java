package com.example.bazaar;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Button menu = findViewById(R.id.button3);
        menu.setOnClickListener(view -> openMenu());

        Button login = findViewById(R.id.button);
        login.setOnClickListener(view -> login());

        Button register = findViewById(R.id.button2);
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