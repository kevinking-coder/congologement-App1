-- Demo preview user — must exist before the owner-scoped rows below FK auth.users(id).
-- password: rapidnative-demo (editor preview only — real GoTrue cannot verify this hash)
insert into auth.users (id, email, encrypted_password, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000001', 'demo@rapidnative.com', 'pbkdf2$100000$52617069644e61746976652044656d6f$ebd41bf86ab4f47040854a1e4968e2fdc414e15db6a4397f3271e1b1d56b2061', now())
on conflict (id) do update
  set email = excluded.email,
      encrypted_password = excluded.encrypted_password,
      email_confirmed_at = excluded.email_confirmed_at;

insert into profiles (id, full_name, phone) values
('00000000-0000-0000-0000-000000000001', 'Jean-Pierre Kabasele', '+243 899 000 000');

insert into listings (id, user_id, category, titre, description, prix_usd, commune, adresse, verified, doc_type, contact_name, contact_phone, photo_1, photo_2, photo_3, property_type, bedrooms, bathrooms, surface_m2, furnished, land_dimensions, land_usage, stars, price_per_night_usd, available_rooms, amenities, max_adults, children_allowed, max_children, deposit_months_min, deposit_months_max, deposit_months_required, created_at) values
('l-1', '00000000-0000-0000-0000-000000000001', 'buy', 'Villa moderne à Gombe', 'Belle villa moderne avec jardin, salon spacieux et garage double. Située dans un quartier calme et sécurisé près des ambassades.', 320000, 'Gombe', 'Av. de la Justice 24', true, 'Titre foncier', 'Jean-Pierre Kabasele', '+243 899 000 001', 'https://pics.rapidnative.app/interior/RphmNomc50ckO0LeWpQwo.jpg', 'https://pics.rapidnative.app/interior/VrH0HK5vohpEQh62NG4b5.jpg', null, 'Maison', 4, 3, 280, true, null, null, null, null, null, null, null, false, null, null, null, null, now() - interval '1 day'),

('l-2', '00000000-0000-0000-0000-000000000001', 'buy', 'Appartement 3 chambres à Ngaliema', 'Appartement lumineux au 4e étage avec vue sur le fleuve. Résidence avec ascenseur et parking sécurisé.', 145000, 'Ngaliema', 'Bd du 30 Juin 118', true, 'Acte de vente notarié', 'Marie Ngalula', '+243 899 000 002', 'https://pics.rapidnative.app/interior/-j4GZ6wYlYq9-uJOC5b20.jpg', null, null, 'Appartement', 3, 2, 160, false, null, null, null, null, null, null, null, false, null, null, null, null, now() - interval '3 days'),

('l-3', '00000000-0000-0000-0000-000000000001', 'rent', 'Appartement meublé à Limete', 'Bel appartement entièrement meublé, idéal pour expatriés. Deux chambres, cuisine équipée, climatisation.', 900, 'Limete', 'Av. Kingabwa 42', false, 'Contrat de bail', 'Patrick Ilunga', '+243 899 000 003', 'https://pics.rapidnative.app/interior/-j4GZ6wYlYq9-uJOC5b20.jpg', null, null, 'Studio', 2, 1, 95, true, null, null, null, null, null, null, null, false, null, 2, 3, 2, now() - interval '2 days'),

('l-4', '00000000-0000-0000-0000-000000000001', 'rent', 'Maison 4 chambres à Bandalungwa', 'Grande maison familiale avec cour, local commercial au rez-de-chaussée. Proche marché et écoles.', 1500, 'Bandalungwa', 'Av. Kasa-Vubu 210', false, '', 'Élodie Mbemba', '+243 899 000 004', 'https://pics.rapidnative.app/interior/VrH0HK5vohpEQh62NG4b5.jpg', null, null, 'Maison', 4, 3, 210, false, null, null, null, null, null, null, null, false, null, 1, 2, 1, now() - interval '5 days'),

('l-5', '00000000-0000-0000-0000-000000000001', 'buy', 'Terrain résidentiel à Masina', 'Terrain clôturé de 600 m², idéal pour construction résidentielle. Titre foncier disponible, zone en plein développement.', 55000, 'Masina', 'Q. Sans Fil', true, 'Titre foncier', 'Daniel Kalala', '+243 899 000 005', 'https://pics.rapidnative.app/nature/Th528FRVd8nR2WHk-cR6H.jpg', null, null, 'Terrain', null, null, 600, null, '600 m² (20m x 30m)', 'Résidentiel', null, null, null, null, null, false, null, null, null, null, now() - interval '2 days'),

('l-6', '00000000-0000-0000-0000-000000000001', 'buy', 'Terrain commercial à Limete', 'Vaste terrain de 1500 m² en bordure du boulevard Lumumba. Parfait pour entrepôt ou commerce.', 210000, 'Limete', 'Bd Lumumba', false, 'Fiche parcellaire', 'Sarah Tshibanda', '+243 899 000 006', 'https://pics.rapidnative.app/nature/Th528FRVd8nR2WHk-cR6H.jpg', null, null, 'Terrain', null, null, 1500, null, '1500 m²', 'Commercial', null, null, null, null, null, false, null, null, null, null, now() - interval '4 days'),

('l-7', '00000000-0000-0000-0000-000000000001', 'hotel', 'Hôtel Fleuve Palace, Gombe', 'Hôtel 4 étoiles au cœur de Gombe. Chambres climatisées, restaurant panoramique, salle de conférence.', 0, 'Gombe', 'Bd du 30 Juin 55', true, 'Licence hôtelière', 'Direction Fleuve Palace', '+243 899 000 007', 'https://pics.rapidnative.app/interior/_h5TuqA8wKRGJjmzhqudV.jpg', 'https://pics.rapidnative.app/interior/jMN7d9-kRELDkcNu9ZoDm.jpg', null, null, null, null, null, null, null, null, 4, 120, 35, 'WiFi, piscine, parking, générateur, petit-déjeuner inclus', 4, true, 2, null, null, null, now() - interval '1 day'),

('l-8', '00000000-0000-0000-0000-000000000001', 'hotel', 'Résidence Kin Plaza', 'Hôtel 3 étoiles moderne à Ngaliema. Chambres confortables, WiFi haut débit, parking sécurisé.', 0, 'Ngaliema', 'Av. de la Libération 9', false, 'Licence hôtelière', 'Accueil Kin Plaza', '+243 899 000 008', 'https://pics.rapidnative.app/interior/jMN7d9-kRELDkcNu9ZoDm.jpg', null, null, null, null, null, null, null, null, null, 3, 70, 18, 'WiFi, parking, générateur, petit-déjeuner inclus', 2, false, null, null, null, null, now() - interval '6 days');

insert into favorites (id, user_id, listing_id) values
('f-1', '00000000-0000-0000-0000-000000000001', 'l-1'),
('f-2', '00000000-0000-0000-0000-000000000001', 'l-7');
