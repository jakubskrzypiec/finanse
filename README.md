# P&T Money — koncepcja premium

Wstępna koncepcja strony P&T Money przygotowana do rozmowy projektowej.

## Kierunek
- elegancki, poważny fintech premium,
- mocne animowane hero bez frameworków,
- użytkownik zaczyna od potrzeby, nie od nazwy produktu,
- interaktywny kalkulator refinansowania jako osobne narzędzie,
- responsive / mobile,
- animacje respektują `prefers-reduced-motion`.

## Uruchomienie
To statyczny projekt. Otwórz `index.html` albo uruchom lokalny serwer, np.:

```bash
python -m http.server 8080
```

Następnie wejdź na `http://localhost:8080`.

## Pliki
- `index.html` — landing P&T Money
- `styles.css` — layout, responsive, animacje
- `script.js` — reveal, FAQ, hero parallax, mobile menu
- `assets/ptmoney-logo.png` — logo
- `tools/refinansowanie/` — działający kalkulator refinansowania

> Formularz kontaktowy na landing page jest demonstracyjny i nie wysyła danych.
