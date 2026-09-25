/**
 * Complete province + territory data for the DRC (26 provinces), plus each
 * province's capital coordinates used as the default map pin when a seller
 * skips dropping a pin on their exact property location.
 */

export interface Province {
  name: string;
  capital: string;
  /** Territory / commune names shown in the "Ville/Commune" selector. */
  places: string[];
  /** Capital coordinates: [latitude, longitude]. */
  coords: [number, number];
}

export const PROVINCES: Province[] = [
  { name: 'Bas-Uélé', capital: 'Buta', places: ['Aketi', 'Ango', 'Bondo', 'Buta', 'Poko'], coords: [2.8, 24.7333] },
  { name: 'Équateur', capital: 'Mbandaka', places: ['Bikoro', 'Bolomba', 'Bomongo', 'Ingende', 'Mbandaka'], coords: [0.0487, 18.2603] },
  { name: 'Haut-Katanga', capital: 'Lubumbashi', places: ['Lubumbashi', 'Likasi', 'Kasumbalesa', 'Kambove', 'Kasenga', 'Kipushi', 'Mitwaba', 'Pweto', 'Sakania'], coords: [-11.6609, 27.4794] },
  { name: 'Haut-Lomami', capital: 'Kamina', places: ['Bukama', 'Kabongo', 'Kamina', 'Kanda-Kanda', 'Malemba-Nkulu'], coords: [-8.7386, 24.9906] },
  { name: 'Haut-Uélé', capital: 'Isiro', places: ['Dungu', 'Faradje', 'Isiro', 'Niangara', 'Rungu', 'Wamba'], coords: [2.7739, 27.6178] },
  { name: 'Ituri', capital: 'Bunia', places: ['Bunia', 'Aru', 'Djugu', 'Irumu', 'Mahagi', 'Mambasa'], coords: [1.5667, 30.25] },
  { name: 'Kasaï', capital: 'Luebo', places: ['Dekese', 'Ilebo', 'Luebo', 'Mweka', 'Tshikapa'], coords: [-5.35, 21.4167] },
  { name: 'Kasaï-Central', capital: 'Kananga', places: ['Demba', 'Dibaya', 'Dimbelenge', 'Kananga', 'Kazumba', 'Luiza'], coords: [-5.8961, 22.4166] },
  { name: 'Kasaï-Oriental', capital: 'Mbuji-Mayi', places: ['Kabeya-Kamwanga', 'Katanda', 'Mbuji-Mayi', 'Miabi', 'Lupatapata', 'Tshilenge'], coords: [-6.136, 23.5895] },
  { name: 'Kinshasa', capital: 'Kinshasa', places: ['Bandalungwa', 'Barumbu', 'Bumbu', 'Gombe', 'Kalamu', 'Kasa-Vubu', 'Kimbanseke', 'Kinshasa', 'Kintambo', 'Kisenso', 'Lemba', 'Limete', 'Lingwala', 'Makala', 'Maluku', 'Masina', 'Matete', 'Mont-Ngafula', 'Ndjili', 'Ngaba', 'Ngaliema', 'Ngiri-Ngiri', 'Nsele', 'Selembao'], coords: [-4.4419, 15.2663] },
  { name: 'Kongo Central', capital: 'Matadi', places: ['Boma', 'Matadi', 'Moanda', 'Mbanza-Ngungu', 'Lukula', 'Luozi', 'Madimba', 'Seke-Banza'], coords: [-5.8206, 13.4505] },
  { name: 'Kwango', capital: 'Kenge', places: ['Feshi', 'Kahemba', 'Kenge', 'Kasongo-Lunda', 'Popokabaka'], coords: [-4.8975, 16.9217] },
  { name: 'Kwilu', capital: 'Bandundu', places: ['Bandundu', 'Kikwit', 'Bagata', 'Bulungu', 'Gungu', 'Idiofa', 'Masi-Manimba'], coords: [-3.3167, 17.3833] },
  { name: 'Lomami', capital: 'Kabinda', places: ['Kabinda', 'Mwene-Ditu', 'Gombe Matadi', 'Luilu', 'Lubao', 'Ngandajika'], coords: [-6.1333, 24.4833] },
  { name: 'Lualaba', capital: 'Kolwezi', places: ['Kolwezi', 'Kasaji', 'Dilolo', 'Kapanga', 'Lubudi', 'Mutshatsha', 'Sandoa'], coords: [-10.7167, 25.4667] },
  { name: 'Mai-Ndombe', capital: 'Inongo', places: ['Inongo', 'Bolobo', 'Kutu', 'Kwamouth', 'Kiri', 'Oshwe', 'Yumbi'], coords: [-1.95, 18.2833] },
  { name: 'Maniema', capital: 'Kindu', places: ['Kindu', 'Kabambare', 'Kasongo', 'Kibombo', 'Lubutu', 'Pangi', 'Punia'], coords: [-2.95, 25.95] },
  { name: 'Mongala', capital: 'Lisala', places: ['Lisala', 'Bumba', 'Basankusu', 'Bongandanga'], coords: [2.15, 21.5167] },
  { name: 'Nord-Kivu', capital: 'Goma', places: ['Goma', 'Beni', 'Butembo', 'Oicha', 'Lubero', 'Masisi', 'Nyiragongo', 'Rutshuru', 'Walikale'], coords: [-1.6792, 29.2228] },
  { name: 'Nord-Ubangi', capital: 'Gbadolite', places: ['Gbadolite', 'Businga', 'Mobayi-Mbongo', 'Yakoma'], coords: [4.2833, 21.0167] },
  { name: 'Sankuru', capital: 'Lusambo', places: ['Lusambo', 'Lodja', 'Katako-Kombe', 'Kole', 'Lomela', 'Lubefu'], coords: [-4.9667, 23.4333] },
  { name: 'Sud-Kivu', capital: 'Bukavu', places: ['Bukavu', 'Uvira', 'Baraka', 'Kamituga', 'Fizi', 'Kalehe', 'Kabare', 'Mwenga', 'Shabunda', 'Walungu'], coords: [-2.5083, 28.8608] },
  { name: 'Sud-Ubangi', capital: 'Gemena', places: ['Gemena', 'Zongo', 'Budjala', 'Kungu', 'Libenge'], coords: [3.25, 19.7667] },
  { name: 'Tanganyika', capital: 'Kalemie', places: ['Kalemie', 'Kabalo', 'Kongolo', 'Manono', 'Moba', 'Nyunzu'], coords: [-5.9475, 29.1947] },
  { name: 'Tshopo', capital: 'Kisangani', places: ['Kisangani', 'Bafwaboli', 'Basoko', 'Isangi', 'Opala', 'Ubundu', 'Yahuma'], coords: [0.5167, 25.1833] },
  { name: 'Tshuapa', capital: 'Boende', places: ['Boende', 'Befale', 'Bokungu', 'Djolu', 'Ikela'], coords: [-0.2833, 20.8667] },
];

export function provinceByName(name: string): Province | undefined {
  return PROVINCES.find((p) => p.name === name);
}

export function capitalCoords(provinceName: string): [number, number] {
  return provinceByName(provinceName)?.coords ?? [-4.4419, 15.2663];
}

export function placesForProvince(provinceName: string): string[] {
  return provinceByName(provinceName)?.places ?? [];
}
