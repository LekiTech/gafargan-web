INSERT INTO "user"
  ("name", email, "password", "language", verified, "role")
VALUES ('Kamran Tadzjibov', 'info@lekitech.io', 'test123', 'Lezgi', true, 'Admin');

INSERT INTO "lang_dialect"
  ("language", "dialect")
-- NEVER CHANGE ORDER OF THESE VALUES, JUST ADD NEW ONCE UNDERNEATH
-- otherwise it will mess up with the ID's and their translations in the website
VALUES ('Lezgi', 'Literary'),
       ('Lezgi', 'Neologism'),
       ('Lezgi', 'Гуьней (Куьре)'),
       ('Lezgi', 'ЯркӀи (Куьре)'),
       ('Lezgi', 'Кьурагь (Куьре)'),
       ('Lezgi', 'Гелхен рахун (Куьре)'),
       ('Lezgi', 'Гилийрин рахун (Куьре)'),
       ('Lezgi', 'Ахцегь (Самур)'),
       ('Lezgi', 'Баш Дашагъыл-Филфили рахун (Самур)'),
       ('Lezgi', 'Докъузпарадин (Самур)'),
       ('Lezgi', 'Къуруш рахун  (Самур)'),
       ('Lezgi', 'Чеперин рахун (Самур)'),
       ('Lezgi', 'Фиярин рахун (Самур)'),
       ('Lezgi', 'Кьвепеледин рахунар (Самур)'),
       ('Lezgi', 'Хъуьлидрин рахун (Самур)'),
       ('Lezgi', 'Хуьруьгрин рахун (Самур)'),
       ('Lezgi', 'Ццуругърин рахун (Самур)'),
       ('Lezgi', 'Игъиррин рахун (Самур)'),
       ('Lezgi', 'Маццарин рахун (Самур)'),
       ('Lezgi', 'Гутумрин рахун (Самур)'),
       ('Lezgi', 'Къуба (Къуба)'),
       ('Lezgi', 'Хъимил (Къуба)'),
       ('Lezgi', 'Кузун (Къуба)'),
       
       ('Tabasaran', NULL),
       ('Russian', NULL),
       ('English', NULL),
       ('Turkish', NULL),
       ('Azerbaijani', NULL),
       ('Persian', NULL),

       ('Arabic', 'Modern Standard Arabic'),
       ('Arabic', 'Classical Arabic (Quranic)');