package com.example.bazaar;

import android.annotation.SuppressLint;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
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
        return new AdvertisementViewHolder(view);
    }

    @SuppressLint("SetTextI18n")
    @Override
    public void onBindViewHolder(@NonNull AdvertisementViewHolder holder, int position) {
        Advertisement advertisement = advertisements.get(position);
        holder.imageView.setImageResource(advertisement.getImageResource());
        holder.textTitle.setText(advertisement.getTitle());
        holder.textDescription.setText(advertisement.getDescription());
        holder.price.setText(advertisement.getPrice().toString());
        holder.date.setText(advertisement.getDate());
        holder.location.setText(advertisement.getlocation());
    }

    @Override
    public int getItemCount() {
        return advertisements.size();
    }

    public static class AdvertisementViewHolder extends RecyclerView.ViewHolder {
        ImageView imageView;
        TextView textTitle;
        TextView textDescription;
        TextView price;
        TextView date;
        TextView location;

        public AdvertisementViewHolder(@NonNull View itemView) {
            super(itemView);
            imageView = itemView.findViewById(R.id.imageView);
            textTitle = itemView.findViewById(R.id.textTitle);
            textDescription = itemView.findViewById(R.id.textDescription);
            price = itemView.findViewById(R.id.price);
            date = itemView.findViewById(R.id.creationDate);
            location = itemView.findViewById(R.id.location);
        }
    }
}