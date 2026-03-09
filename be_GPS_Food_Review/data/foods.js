const foods = [
  {
    id: "pho-ong-hung",
    coordinate: { lat: 10.772343, lng: 106.698328 },
    radiusMeters: 12,
    imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
    translations: {
      vi: {
        name: "Pho Ong Hung",
        specialty: "Pho bo tai",
        description: "Nuoc dung trong, thom que hoi va bo tuoi cat tai cho.",
        address: "12 Nguyen Hue"
      },
      en: {
        name: "Ong Hung Pho",
        specialty: "Rare beef pho",
        description: "A clear aromatic broth with cinnamon and freshly sliced beef.",
        address: "12 Nguyen Hue Street"
      }
    }
  },
  {
    id: "banh-mi-hoa-phuong",
    coordinate: { lat: 10.771842, lng: 106.699681 },
    radiusMeters: 10,
    imageUrl: "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=800&q=80",
    translations: {
      vi: {
        name: "Banh Mi Hoa Phuong",
        specialty: "Banh mi dac biet",
        description: "Vo banh gion, pate nha lam va sot bo dac trung.",
        address: "28 Le Loi"
      },
      en: {
        name: "Hoa Phuong Banh Mi",
        specialty: "Signature mixed banh mi",
        description: "Crunchy baguette with house pate and buttery signature sauce.",
        address: "28 Le Loi Street"
      }
    }
  },
  {
    id: "bun-thit-nuong-ba-lan",
    coordinate: { lat: 10.773428, lng: 106.700437 },
    radiusMeters: 10,
    imageUrl: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80",
    translations: {
      vi: {
        name: "Bun Thit Nuong Ba Lan",
        specialty: "Bun thit nuong cha gio",
        description: "Thit nuong than hoa an kem nuoc mam chua ngot va do chua.",
        address: "5 Mac Thi Buoi"
      },
      en: {
        name: "Ba Lan Grilled Pork Vermicelli",
        specialty: "Vermicelli with grilled pork and spring rolls",
        description: "Charcoal grilled pork over noodles with pickles and fish sauce.",
        address: "5 Mac Thi Buoi Street"
      }
    }
  }
];

module.exports = foods;
