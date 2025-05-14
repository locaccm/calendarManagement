--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5 (Ubuntu 17.5-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: USER; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."USER" ("USEN_ID", "USEC_URLPP", "USEC_LNAME", "USEC_FNAME", "USEC_TYPE", "USEC_BIO", "USED_BIRTH", "USEC_TEL", "USEC_ADDRESS", "USEC_MAIL", "USEC_PASSWORD", "USEN_INVITE") VALUES (1, 'https://example.com/photo_owner.jpg', 'Maxime', 'TestName', 'OWNER', 'Passionné dimmobilier et de voyages.', '1980-05-15', '0612345678', '10 rue de la Paix, 75001 Paris', 'jean.dupont@example.com', 'motdepasse1', NULL);
INSERT INTO public."USER" ("USEN_ID", "USEC_URLPP", "USEC_LNAME", "USEC_FNAME", "USEC_TYPE", "USEC_BIO", "USED_BIRTH", "USEC_TEL", "USEC_ADDRESS", "USEC_MAIL", "USEC_PASSWORD", "USEN_INVITE") VALUES (2, 'https://example.com/photo_tenant1.jpg', 'Martin', 'Sophie', 'TENANT', 'À la recherche dun appartement confortable.', '1992-08-22', '0798765432', '5 avenue des Fleurs, 69000 Lyon', 'sophie.martin@example.com', 'securepass2', 1);
INSERT INTO public."USER" ("USEN_ID", "USEC_URLPP", "USEC_LNAME", "USEC_FNAME", "USEC_TYPE", "USEC_BIO", "USED_BIRTH", "USEC_TEL", "USEC_ADDRESS", "USEC_MAIL", "USEC_PASSWORD", "USEN_INVITE") VALUES (3, 'https://example.com/photo_tenant2.jpg', 'Lefevre', 'Pierre', 'TENANT', 'Étudiant calme et respectueux.', '2001-03-10', '0655555555', '12 boulevard Carnot, 59000 Lille', 'pierre.lefevre@example.com', 'password3', 1);
INSERT INTO public."USER" ("USEN_ID", "USEC_URLPP", "USEC_LNAME", "USEC_FNAME", "USEC_TYPE", "USEC_BIO", "USED_BIRTH", "USEC_TEL", "USEC_ADDRESS", "USEC_MAIL", "USEC_PASSWORD", "USEN_INVITE") VALUES (4, 'https://example.com/photo_tenant3.jpg', 'Dubois', 'Julie', 'TENANT', 'Jeune active, aimant les animaux.', '1995-06-28', '0711223344', '7 rue Voltaire, 44000 Nantes', 'julie.dubois@example.com', 'juliette', 1);


--
-- Data for Name: ACCOMMODATION; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."ACCOMMODATION" ("ACCN_ID", "ACCC_NAME", "ACCC_TYPE", "ACCC_DESC", "ACCC_ADDRESS", "ACCB_AVAILABLE", "USEN_ID") VALUES (3, 'Studio meublé proche fac', 'Appartement', 'Studio idéal pour étudiant, entièrement équipé.', '8 rue de lUniversité, 69100 Villeurbanne', true, 1);
INSERT INTO public."ACCOMMODATION" ("ACCN_ID", "ACCC_NAME", "ACCC_TYPE", "ACCC_DESC", "ACCC_ADDRESS", "ACCB_AVAILABLE", "USEN_ID") VALUES (5, 'House n°5', 'House', 'Tema la taille de la modif.', '123 rue de la modif', true, 1);
INSERT INTO public."ACCOMMODATION" ("ACCN_ID", "ACCC_NAME", "ACCC_TYPE", "ACCC_DESC", "ACCC_ADDRESS", "ACCB_AVAILABLE", "USEN_ID") VALUES (1, 'Appartement cosy centre-ville', 'Appartement', 'Charmant T2 entièrement rénové.', '16 rue du Centre, 75002 Paris', true, 1);
INSERT INTO public."ACCOMMODATION" ("ACCN_ID", "ACCC_NAME", "ACCC_TYPE", "ACCC_DESC", "ACCC_ADDRESS", "ACCB_AVAILABLE", "USEN_ID") VALUES (2, 'Maison avec jardin au calme', 'Maison', 'Grande maison familiale avec jardin et terrasse.', '20 avenue de la Gare, 33000 Bordeaux', false, 1);
INSERT INTO public."ACCOMMODATION" ("ACCN_ID", "ACCC_NAME", "ACCC_TYPE", "ACCC_DESC", "ACCC_ADDRESS", "ACCB_AVAILABLE", "USEN_ID") VALUES (4, 'Loft industriel avec vue', 'Appartement', 'Spacieux loft avec de grandes baies vitrées.', '1 rue des Ateliers, 13000 Marseille', false, 1);


--
-- Data for Name: EVENT; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."EVENT" ("EVEN_ID", "EVEC_LIB", "EVED_START", "EVED_END", "USEN_ID", "ACCN_ID") VALUES (1, 'Visite appartement T2', '2025-05-10 14:00:00', '2025-05-10 15:00:00', 1, 1);
INSERT INTO public."EVENT" ("EVEN_ID", "EVEC_LIB", "EVED_START", "EVED_END", "USEN_ID", "ACCN_ID") VALUES (2, 'Réparation toiture', '2025-05-15 09:00:00', '2025-05-15 12:00:00', 1, 2);
INSERT INTO public."EVENT" ("EVEN_ID", "EVEC_LIB", "EVED_START", "EVED_END", "USEN_ID", "ACCN_ID") VALUES (4, 'Assemblée générale des copropriétaires', '2025-07-20 18:00:00', '2025-07-20 21:00:00', 1, 1);
INSERT INTO public."EVENT" ("EVEN_ID", "EVEC_LIB", "EVED_START", "EVED_END", "USEN_ID", "ACCN_ID") VALUES (5, 'Nettoyage des parties communes', '2025-05-25 08:00:00', '2025-05-25 10:00:00', 1, 2);
INSERT INTO public."EVENT" ("EVEN_ID", "EVEC_LIB", "EVED_START", "EVED_END", "USEN_ID", "ACCN_ID") VALUES (3, 'État des lieux sortie locataire + test', '2025-06-01 10:30:00', '2025-06-01 11:30:00', 1, 3);
INSERT INTO public."EVENT" ("EVEN_ID", "EVEC_LIB", "EVED_START", "EVED_END", "USEN_ID", "ACCN_ID") VALUES (11, 'Test ISO', '2025-06-01 09:00:00', '2025-06-01 11:00:00', 99, 99);
INSERT INTO public."EVENT" ("EVEN_ID", "EVEC_LIB", "EVED_START", "EVED_END", "USEN_ID", "ACCN_ID") VALUES (12, 'Test multi-jours', '2025-08-01 09:00:00', '2025-08-03 18:00:00', 101, 101);
INSERT INTO public."EVENT" ("EVEN_ID", "EVEC_LIB", "EVED_START", "EVED_END", "USEN_ID", "ACCN_ID") VALUES (13, 'Test split', '2025-07-10 14:00:00', '2025-07-10 16:00:00', 100, 100);


--
-- Data for Name: LEASE; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."LEASE" ("LEAN_ID", "LEAD_START", "LEAD_END", "LEAN_RENT", "LEAN_CHARGES", "LEAD_PAYMENT", "LEAB_ACTIVE", "USEN_ID", "ACCN_ID") VALUES (1, '2024-09-01', '2025-08-31', 1200.00, 150.00, '2025-05-01', true, 2, 1);
INSERT INTO public."LEASE" ("LEAN_ID", "LEAD_START", "LEAD_END", "LEAN_RENT", "LEAN_CHARGES", "LEAD_PAYMENT", "LEAB_ACTIVE", "USEN_ID", "ACCN_ID") VALUES (2, '2024-10-15', '2025-10-14', 650.00, 50.00, '2025-05-03', true, 3, 3);
INSERT INTO public."LEASE" ("LEAN_ID", "LEAD_START", "LEAD_END", "LEAN_RENT", "LEAN_CHARGES", "LEAD_PAYMENT", "LEAB_ACTIVE", "USEN_ID", "ACCN_ID") VALUES (3, '2025-01-01', '2025-06-30', 900.00, 100.00, '2025-05-02', false, 4, 4);


--
-- Data for Name: MESSAGE; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (1, 2, 1, 'Bonjour Sophie, la visite est confirmée pour samedi à 14h.', '2025-05-07 10:00:00', true);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (2, 1, 2, 'Parfait, à samedi !', '2025-05-07 10:15:00', false);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (3, 3, 1, 'Bonjour Pierre, noubliez pas votre dossier pour la visite.', '2025-05-08 15:30:00', true);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (4, 1, 3, 'Bien reçu, merci.', '2025-05-08 15:45:00', false);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (5, 4, 1, 'Bonjour Julie, comment sest passée votre installation ?', '2025-05-03 18:00:00', false);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (11, 2, 1, 'Hello from test!', '2025-05-10 18:42:52.377457', true);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (12, 2, 1, 'Hello from test!', '2025-05-11 11:49:51.400673', true);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (13, 2, 1, 'Hello from test!', '2025-05-11 19:07:03.259', true);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (14, 2, 1, 'Hello from test!', '2025-05-11 19:12:29.66', true);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (15, 2, 1, 'Hello from test!', '2025-05-11 19:22:41.488', true);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (16, 2, 1, 'Hello', '2025-05-13 20:23:44.56482', false);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (17, 2, 1, 'Hello', '2025-05-13 20:24:24.630149', false);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (18, 2, 1, 'Hello', '2025-05-13 20:26:12.921835', false);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (19, 2, 1, 'Hello, world!', '2025-05-13 21:18:31.25552', false);
INSERT INTO public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") VALUES (20, 2, 1, 'Hello, world!', '2025-05-13 21:19:43.809272', false);


--
-- Name: ACCOMMODATION_ACCN_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ACCOMMODATION_ACCN_ID_seq"', 11, true);


--
-- Name: EVENT_EVEN_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."EVENT_EVEN_ID_seq"', 13, true);


--
-- Name: LEASE_LEAN_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."LEASE_LEAN_ID_seq"', 11, false);


--
-- Name: MESSAGE_MESN_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."MESSAGE_MESN_ID_seq"', 20, true);


--
-- Name: USER_USEN_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."USER_USEN_ID_seq"', 11, false);


--
-- PostgreSQL database dump complete
--

