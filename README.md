# QuizTSRB ✦

Eine moderne, kostenlose Quiz-Website auf Deutsch – direkt im Browser spielbar, ohne Anmeldung und ohne Backend.

## Funktionen

- 12 Wissenskategorien + Alles gemischt
- 77 vorgefertigte Quizfragen (inklusive Wahr/Falsch)
- Klassisch, Blitz-Quiz (15 Sekunden pro Frage), Überleben (3 Leben), Wahr/Falsch
- Schwierigkeitsgrade Einfach, Mittel, Schwer oder Gemischt
- 5, 10 oder 20 Fragen (wenn genügend im gewählten Filter verfügbar sind)
- Tages-Challenge mit datumsabhängiger Fragenauswahl
- Punktezähler (100 Punkte je richtiger Antwort plus Serienbonus), Spielstatistiken, lokale Bestwerte
- Responsives Design, Dark-/Light-Mode, Tastenkürzel 1–4
- Keine Benutzerkonten, kein Tracking, keine Serververbindung für das Spiel

## Lokal starten

Öffne `index.html` im Browser. Alle Dateien liegen im Projekt selbst; die Schrift wird optional von Google Fonts geladen.

## Mit GitHub Pages veröffentlichen

Öffne das Repository auf GitHub und wähle **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save**.

Danach ist die Seite unter **https://cedrictsrb.github.io/QuizTSRB/** (ohne Leerzeichen im Benutzernamen) erreichbar, sobald GitHub Pages die Veröffentlichung abgeschlossen hat.

## Fragen ergänzen

In `questions.js` neue Objekte zur Liste `window.QUIZ_QUESTIONS` hinzufügen. Format:

```js
{
  id: 1001,
  category: "gaming",
  difficulty: "medium",
  question: "Deine Frage?",
  answers: ["Richtige Antwort", "Falsch A", "Falsch B", "Falsch C"],
  correct: 0
}
```

Die Antworten werden für normale Quizfragen automatisch gemischt. Für Wahr/Falsch die Kategorie `tf` und als zwei Antworten zuerst die richtige Entscheidung und danach die andere angeben. Bei einem falschen Aussagesatz also `["Falsch", "Wahr"]`.

## Projektdateien

- `index.html` – Seitenaufbau
- `style.css` – Layout, Farben, Animationen, Mobilansicht
- `questions.js` – Fragenbank
- `app.js` – Spielmechanik, Anzeige, Speicherlogik
- `favicon.svg` – Website-Symbol

## Datenschutz

Highscores, Spielanzahl und Einstellungen liegen ausschließlich im lokalen Browserspeicher (`localStorage`). Es gibt keine übergreifende Online-Rangliste.
