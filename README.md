# Sprach-App

A small German word board for children who learn to communicate with pictures and signs: tap a word, see its
picture, hear it and watch its sign-language video. The words are sorted into groups, and an adult can change
words, pictures, recordings and groups on the device.

This repository holds the built website only: the page (with the pictures and the spoken words inside it), the
service worker that keeps it for use without an internet connection, and the sign videos of the bundled words.

## Use on an iPad

Open https://norbert110.github.io/sprachapp/ in Safari, tap the share button, choose "Zum Home-Bildschirm" and
open the app from its new icon. The app then copies the sign videos to the device (about 300 MB) and works
without an internet connection afterwards.

## Content and licences

- Pictograms: the pictographic symbols are the property of the Government of Aragón and were created by
  Sergio Palao for ARASAAC (https://arasaac.org), which distributes them under the Creative Commons licence
  BY-NC-SA (terms of use: https://arasaac.org/terms-of-use). They are embedded in the page, scaled down and
  converted to WebP.
- Sign videos (folder `signs`): from the sign dictionary of https://gebaerdenlernen.de, licence
  CC BY-NC-SA 3.0 DE (https://creativecommons.org/licenses/by-nc-sa/3.0/de/). The video files are unchanged.
- Voice: the bundled words are read by "Thorsten", a free German voice by Thorsten Müller
  (https://github.com/thorstenMueller/Thorsten-Voice, released under CC0). The clips were made with the Piper
  speech engine (voice de_DE-thorsten-high) and are embedded in the page as MP3. Words an adult adds are read
  by the voice of the device or by a recording made in the app.

The licences of the pictograms and the sign videos allow non-commercial use only, with attribution and under
the same conditions. The voice clips carry no such conditions.
