# Мост к Telegram API

Сервер devlarion.ru находится в России и не достаёт до api.telegram.org. Запросы идут так:
127.0.0.1:8088 (RU) → SSH-туннель (ключ /etc/devlarion-tunnel, пользователь tgtunnel, только permitopen 127.0.0.1:8088) → пересыльщик в Риге (127.0.0.1:8088) → api.telegram.org.

1. Рига (81.85.74.248): создать пользователя `tgtunnel`, добавить публичный ключ с `permitopen="127.0.0.1:8088"` и выполнить `riga-setup.sh`.
2. Россия: создать ключ `/etc/devlarion-tunnel` и выполнить `ru-setup.sh`.
3. Вызовы вида `http://127.0.0.1:8088/bot<TOKEN>/getMe` работают.
