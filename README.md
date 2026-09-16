# 📚 Shelf of Books · Kişisel Okuma Günlüğü

Referans alınan minimalist Framer kitaplık estetiğini (**Shelf of Books**), modern web teknolojileri (**React + Tailwind CSS + Framer Motion + Lucide Icons**) ile tam işlevsel bir okuma günlüğüne dönüştüren web uygulaması.

---

## ✨ Özellikler

1. **İki Farklı Raf Görünümü (Interactive Bookshelf):**
   - **Kapak Görünümü:** Kitapların ön kapakları rafta dizilir, hover edildiğinde 3D perspektifle hafifçe öne çıkar.
   - **Kitap Sırtı (Spine) Görünümü:** Tıpkı gerçek bir kütüphanede olduğu gibi kitap sırtları yan yana dizilir. Sayfa sayısına göre kalınlıkları değişir.
2. **Kitaba Tıklayınca Açılan Detay Modalı:**
   - Kitabın 3D kapak görünümü, sayfa sayısı, basım yılı, okunma tarihi.
   - **Puanlama (Rating):** Doğrudan yıldızlara tıklayarak puanı güncelleyebilme.
   - **Fikirlerim & İncelemem:** Kitap hakkında notlar yazabilme ve istediğin an düzenleyebilme.
   - **Alıntılar (Quotes):** Kitaptan altını çizdiğin unutulmaz cümleleri kart olarak saklayabilme ve yeni alıntı ekleyebilme.
3. **"+" Sihirli Kitap Ekleme (Google Books API Entegrasyonu):**
   - Kitap veya yazar adını arattığınızda orijinal kapak görselini, sayfa sayısını, basım yılını otomatik çeker.
   - Dilerseniz manuel olarak da kitap bilgisi ve sırt rengi seçebilirsiniz.
4. **Filtreleme & Arama:**
   - Kategori filtreleri (Bilim Kurgu, Felsefe, Edebiyat, Psikoloji, vb.).
   - Durum filtreleri (Tümü, Okunanlar, Şu An Okunuyor, İstek Listesi).
   - Canlı anlık arama (kitap adı, yazar veya notlarda geçen kelimelere göre).
5. **İstatistikler & Kutlama:**
   - Okunan kitap sayısı, ortalama puan, toplam sayfa sayısı ve aktif okunanlar.
   - Bir kitabı bitirdiğinizde konfeti patlama efekti! 🎉
6. **Kalıcı Hafıza & Yedekleme (Backup):**
   - Tüm veriler tarayıcınızın `localStorage` alanında güvenle saklanır.
   - **JSON İndir (Yedekle):** Kitaplığınızı tek tıkla dosya olarak bilgisayarınıza indirebilirsiniz.
   - **JSON Yükle:** Başka cihazlardan veya arkadaşlarınızın kitaplık dosyasını içe aktarabilirsiniz.

---

## 🚀 Çalıştırma

Proje klasöründe terminali açıp:

```bash
npm run dev
```

Ardından tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.
Aynı yerel ağdaki (Wi-Fi) telefonunuzdan da terminalde görünen IP adresinden (`http://192.168.1.xxx:3000`) erişebilirsiniz!

---

## 🌐 Ücretsiz Yayına Alma (Arkadaşlarınla Paylaşma)

Bu projeyi Vercel veya Netlify'a tek tıkla yükleyip internette yayınlayabilirsiniz:

1. Bu klasörü GitHub'a yükleyin:
   ```bash
   git init
   git add .
   git commit -m "feat: initial bookshelf release"
   ```
2. [Vercel](https://vercel.com) veya [Netlify](https://netlify.com) üzerinde GitHub reponuzu bağlayın.
3. Otomatik olarak derlenecek ve size ücretsiz bir alan adı (örn: `kitapligim.vercel.app`) verecektir!
