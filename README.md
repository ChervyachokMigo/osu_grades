# Osu Grades (Осу оценки)
## Установка
- Установить [Node.js](https://nodejs.org/en), (если нет), рекомендуется стабильную версию (LTS), на данный момент версия 20.11.1
- Установить [MYSQL](https://dev.mysql.com/downloads/installer/), на данный момент 8.0.36
  - При установке выбрать `legacy password`
  - Указать пароль без спецсимволов, возможны ошибки
- Скопировать репозиторий `git clone https://github.com/ChervyachokMigo/osu_grades`
- Распаковать в удобное место 
  > Во избежании непредвиденых ошибок, в пути должны быть только английские буквы
- Установка модулей:
  - Выполнить команду из корня распакованой папки `npm install` и затем `npm update`;
  - либо запустить `0 npm_install.bat`, где выполняется то же самое.
## Настройка
- Копирование шаблон файла конфигурации: запустить `1 set_config.bat` 
  > Батник создат папку `data` и скопирует пример конфигурации из `misc/config-sample.js`. затем переименует его в `config.js` и запустит для редактирования
- Редактирование `config.js` (в любом текстовом редакторе, например [Sublime text](https://www.sublimetext.com/download) или [Notepad++](https://notepad-plus-plus.org/downloads/))
  > Использование стандартного блокнота не рекомендуется, он не подсвечивает синтаксис (Не удобно)
   
  - Необходимо заполнить следующие **обязательные параметры**
  
    Писать нужно между одинарных кавычек: `'Пример текста'`

	Параметер | Значение
    -|-
  	**DB_HOST** | IP-адрес, где стоит MYSQL, по умолчанию `'localhost'` или `'127.0.0.1'`, можно не изменять
	**DB_PORT** | Порт для соединения с базой данных, по умолчанию `'3306'`, можно не изменять
    **DB_USER** | Имя пользователя, которое вы указали при установке MYSQL, либо предварительно создали
  	**DB_PASSWORD** | Пароль пользователя MYSQL
	**api_key** | Ключ доступа для `Устаревшего API` (osu v1 legacy). После создания ключа в профиле будет отображен ключ, который необходимо заполнить в это поле
	**api_v2_app_id** | `ID приложения` из категории `Oauth` профиля
	**api_v2_app_key** | `Ключ приложения` из категории `Oauth` профиля

	> [!TIP] Информация про ключи доступа к osu
	> Ключи можно создать из [профиля osu](https://osu.ppy.sh/home/account/edit), Находится в самом низу. 
	> <hr>
	> 
	> Для `Устаревшего API` - osu v1 (legacy):
	> - `Имя приложения` любое или **osu_grades**
	> - `URL приложения` любое или ссылку на это приложение **https://github.com/ChervyachokMigo/osu_grades**
	> 
	> Всё, что использует в этом приложении этот ключ называется `Score Mode v1`
	> <hr>
	>
	> Для `Oauth API` - osu v2 (laser), для создания нажмите `Новое приложение OAuth`, откроется ``Регистрация нового приложения``, заполнить поля:
	> - `Имя приложения` любое или **osu_grades**
	> - `Callback приложения` любое например **http://localhost**
	> 
	> Создадутся ваши новые данные для доступа к API
	> 
	> Всё, что использует в этом приложении этот ключ называется `Score Mode v2`

  - **Необязательные параметры** в *config.js*, которые потребуются не сразу, а только для определенных функций либо косметические
  
    Параметер | Значение
    -|-
	**DB_NAME_BEATMAPS** | Имя базы данных для карт 
	**DB_NAME_SCORES**   | Имя базы данных для очков и всего, что с ними связано
	**backup_instead_remove** | означает не удалять json-файлы скоров, используется для импорта из json-файлов в базу данных, `true|false`
	**print_progress_import_jsons_frequency** | частота вывода информации о прогрессе импорта json-файлов, `положительное число`
	**is_use_caching** | использовать ли кэширование, при повторном сканировании с нуля, `true|false`
	**is_delete_cache** | Удалять ли кэш, `true|false`
	**cache_expire_time_hours** | если кэш удаляется, то через сколько времени, в часах `положительное число`
	**osu_path** | `путь к осу`, используется для создания коллекций или импорта скоров в osu. Для **Windows** обратный слэш `\` нужно писать двойной `\\` 

## Описание лаунчера
### Версия API
Для начала нужно определиться с выбором `версии API`, которые будем сканировать.

| API    | Описание
|--------|-----------------------------|
| **v1** | legacy версия, оценки обычной осу, поддерживает все карты, немного быстрее чем v2
| **v2** | laser версия, оценки будут из осу лазера, некоторые карты невозможно получить, из-за особенностей osu-web и блокировки по [DMCA](https://osu.ppy.sh/legal/ru/Copyright), а также эта версия немного медленее
| **v2 json** | первая версия этого приложения с использованием json-файлов, не оптимальная, для совместимости, рекомендуется не использовать

### Получение ID профиля osu 
Узнайте `ID своего профиля` или профиля, который собираетесь сканировать, в **osu** из строки браузера, последние цифры:
> Пример: https://osu.ppy.sh/users/**9547517**

### **О приложении**

Запуск начальной точки (или лаунчера) через `2 launcher.bat`; Приложение выполняется в консоли, перед запуском подготавливает базу данных;

**Управление**
Кнопка  |  Действие
-|-
`↑` `↓` | Перемещение по пунктам меню 
`Enter` | Подтверждение                
`Пробел`| Выбор пункта в меню выбора (checkboxes) 

### Пункты меню

`< Back` Возвращает в предыдущее меню

`Users Menu` Управление пользователями для сканирования

- `Add/Change user` Операция добавления пользователя 
- `Delete user` Операция удаления пользователя 
- `Show list users` Операция просмотра списка пользователей

`Update beatmaps` Показывает список операций для получения информации о картах, разделенных по типу **osu API** (`v1`, `v2`), игровым режимам (`ALL`, `OSU`, `TAIKO`, `FRUITS`, `MANIA`), а также возможности продолжить с предыдущего сканирования (`continue`) или начать с первой карты (`from begin`); 
> [!TIP] Двигаясь ниже или выше по меню можно увидеть другие варианты (их не 7)

`Scores` Различные операции по управлению скорами
- `Get Scores` Основное меню для получения информации по скорам с Bancho (официального сервера osu), выбор при помощи `пробела`, если вариантов больше 2
- `Refresh Scores` Получение недавних скоров пользователя, и подсчет оценок (необязательный пункт меню)
- `V2_JSON_RECOUNT` Подсчет оценок для режима `v2 json`(устаревший пункт меню)
- `Import json scores to DB` Импорт json-файлов в базу с выбором `v1` или `v2` (устаревший пункт меню)

`Webserver` Отображение осу оценок через локальный вебсервер
 - `Start webserver` Запустить
 - `Stop webserver` Остановить
 - `Restart webserver` Перезапустить
 - `Open webserver` Открыть в браузере
 - `Edit config` Редактировать файл конфигурации вебсервера (По сути это редактор для файла `data/webserver_config.json`)
	Параметр  | Значение
	-|-
	HTTP Port | Порт вебсервера
	Socket Port | Внутренний порт вебсервера для передачи информации между веб страницей и приложением
	Autoupdate | Выбрать автообновлять ли страницу и с каким интервалом
	User | Выбор пользователя для оценок
	Gamemode | Выбор режима игры для оценок
	Score Mode | Режим скоров
	Sort Method | Порядок сортировки оценок
 - `Restart config` Сбросить настройки вебсервера по умолчанию

`Tools` Инструменты для архивирования базы и импорта в игру

## Порядок запуска
1. `Update beatmaps` Обновить карты в одном из режимов
2. `Add user` Добавить пользователя для получения скоров (если нет)
3. `Get scores` Получить скоры выбранного пользователя (можно несколько), 
   > Долгая операция, длительность зависит от режима игры и типа API, ~12 часов на пользователя
4. `Webserver > Edit Config` Настроить пользователя для отображения
5. `Webserver > Start` Запустить
6. `Webserver > Open` Зайти любую на страницу
7. Дождаться обновления скоров (~2 мин при первом запуске)

## Обратная связь
### [Раздел гитхаба для ошибок](https://github.com/ChervyachokMigo/osu_grades/issues)

 Возникли ошибки - пишите что случилось, что делали и результат, посмотрим и исправим
### Контакты
По вопросам и предолжениям, пишите в любой из контактов

> Discord: svdgod
> 
> [VK](https://vk.com/svdg0d)
>
> [Telegram](https://t.me/SVDG0D)
>
> [Дискорд сервер](https://discord.com/invite/jq9y7atnBS)
>
> [Steam](https://steamcommunity.com/id/svdgod/)
>
> [Osu Profile](https://osu.ppy.sh/users/9547517)
>
> [Матераильная благодарность](https://www.donationalerts.com/r/sed_god)

