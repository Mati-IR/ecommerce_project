package com.example.bazaar;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class AdvertisementAdapter extends RecyclerView.Adapter<AdvertisementAdapter.AdvertisementViewHolder> {

    private List<Advertisement> advertisements;

    public AdvertisementAdapter(List<Advertisement> advertisements) {
        this.advertisements = advertisements;
    }

    @NonNull
    @Override
    public AdvertisementViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.advertisement, parent, false);
        return new AdvertisementViewHolder(view, advertisements);
    }

    @SuppressLint("SetTextI18n")
    @Override
    public void onBindViewHolder(@NonNull AdvertisementViewHolder holder, int position) {
        Advertisement advertisement = advertisements.get(position);
        holder.imageView.setImageResource(advertisement.getImageResource());
        holder.textTitle.setText(advertisement.getTitle());
        holder.price.setText(advertisement.getPrice().toString());
        holder.date.setText(advertisement.getDate());
    }

    @Override
    public int getItemCount() {
        return advertisements.size();
    }

    public static class AdvertisementViewHolder extends RecyclerView.ViewHolder {
        ImageView imageView;
        TextView textTitle;
        TextView price;
        TextView date;
        TextView location;
        Button description;
        private List<Advertisement> advertisements;

        public AdvertisementViewHolder(@NonNull View itemView, List<Advertisement> superAdvertisements) {
            super(itemView);
            imageView = itemView.findViewById(R.id.imageView);
            textTitle = itemView.findViewById(R.id.textTitle);
            price = itemView.findViewById(R.id.price);
            date = itemView.findViewById(R.id.creationDate);
            description = itemView.findViewById(R.id.description);
            advertisements = superAdvertisements;
            description.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    // Pobranie pozycji ogłoszenia w RecyclerView
                    int position = getAdapterPosition();

                    // Sprawdzenie, czy pozycja jest prawidłowa
                    if (position != RecyclerView.NO_POSITION) {
                        // Pobranie ogłoszenia na podstawie pozycji
                        Advertisement advertisement = advertisements.get(position);

                        // Przekazanie danych ogłoszenia do nowej aktywności
                        Intent intent = new Intent(v.getContext(), Description.class);
                        intent.putExtra("title", advertisement.getTitle());
                        intent.putExtra("description", advertisement.getDescription());
                        intent.putExtra("price", advertisement.getPrice());
                        String[] coordinates = advertisement.getlocation().split(",");
                        double latitude = Double.parseDouble(coordinates[0].trim());
                        double longitude = Double.parseDouble(coordinates[1].trim());
                        intent.putExtra("latitude", latitude);
                        intent.putExtra("longitude", longitude);
                        intent.putExtra("id",advertisement.getId());
                        // Uruchomienie nowej aktywności
                        v.getContext().startActivity(intent);
                    }
                }
            });
        }
    }



}