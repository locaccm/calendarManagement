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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ACCOMMODATION; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ACCOMMODATION" (
    "ACCN_ID" integer NOT NULL,
    "ACCC_NAME" character varying(255),
    "ACCC_TYPE" character varying(50),
    "ACCC_DESC" text,
    "ACCC_ADDRESS" text,
    "ACCB_AVAILABLE" boolean DEFAULT true,
    "USEN_ID" integer
);


--
-- Name: ACCOMMODATION_ACCN_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ACCOMMODATION_ACCN_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ACCOMMODATION_ACCN_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ACCOMMODATION_ACCN_ID_seq" OWNED BY public."ACCOMMODATION"."ACCN_ID";


--
-- Name: EVENT; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EVENT" (
    "EVEN_ID" integer NOT NULL,
    "EVEC_LIB" character varying(255) NOT NULL,
    "EVED_START" timestamp without time zone NOT NULL,
    "EVED_END" timestamp without time zone NOT NULL,
    "USEN_ID" integer NOT NULL,
    "ACCN_ID" integer NOT NULL
);


--
-- Name: EVENT_EVEN_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."EVENT_EVEN_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EVENT_EVEN_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."EVENT_EVEN_ID_seq" OWNED BY public."EVENT"."EVEN_ID";


--
-- Name: LEASE; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LEASE" (
    "LEAN_ID" integer NOT NULL,
    "LEAD_START" date,
    "LEAD_END" date,
    "LEAN_RENT" numeric(10,2),
    "LEAN_CHARGES" numeric(10,2),
    "LEAD_PAYMENT" date,
    "LEAB_ACTIVE" boolean DEFAULT true,
    "USEN_ID" integer,
    "ACCN_ID" integer
);


--
-- Name: LEASE_LEAN_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."LEASE_LEAN_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: LEASE_LEAN_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."LEASE_LEAN_ID_seq" OWNED BY public."LEASE"."LEAN_ID";


--
-- Name: MESSAGE; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MESSAGE" (
    "MESN_ID" integer NOT NULL,
    "MESN_RECEIVER" integer,
    "MESN_SENDER" integer,
    "MESC_CONTENT" text,
    "MESD_DATE" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "MESB_NEW" boolean DEFAULT true
);


--
-- Name: MESSAGE_MESN_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."MESSAGE_MESN_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: MESSAGE_MESN_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."MESSAGE_MESN_ID_seq" OWNED BY public."MESSAGE"."MESN_ID";


--
-- Name: USER; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."USER" (
    "USEN_ID" integer NOT NULL,
    "USEC_URLPP" character varying(255),
    "USEC_LNAME" character varying(255),
    "USEC_FNAME" character varying(255),
    "USEC_TYPE" character varying(10),
    "USEC_BIO" text,
    "USED_BIRTH" date,
    "USEC_TEL" character varying(15),
    "USEC_ADDRESS" text,
    "USEC_MAIL" character varying(255),
    "USEC_PASSWORD" text,
    "USEN_INVITE" integer,
    CONSTRAINT chk_user_type CHECK ((((("USEC_TYPE")::text = 'TENANT'::text) AND ("USEN_INVITE" IS NOT NULL)) OR ((("USEC_TYPE")::text = 'OWNER'::text) AND ("USEN_INVITE" IS NULL))))
);


--
-- Name: USER_USEN_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."USER_USEN_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: USER_USEN_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."USER_USEN_ID_seq" OWNED BY public."USER"."USEN_ID";


--
-- Name: ACCOMMODATION ACCN_ID; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ACCOMMODATION" ALTER COLUMN "ACCN_ID" SET DEFAULT nextval('public."ACCOMMODATION_ACCN_ID_seq"'::regclass);


--
-- Name: EVENT EVEN_ID; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EVENT" ALTER COLUMN "EVEN_ID" SET DEFAULT nextval('public."EVENT_EVEN_ID_seq"'::regclass);


--
-- Name: LEASE LEAN_ID; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LEASE" ALTER COLUMN "LEAN_ID" SET DEFAULT nextval('public."LEASE_LEAN_ID_seq"'::regclass);


--
-- Name: MESSAGE MESN_ID; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MESSAGE" ALTER COLUMN "MESN_ID" SET DEFAULT nextval('public."MESSAGE_MESN_ID_seq"'::regclass);


--
-- Name: USER USEN_ID; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."USER" ALTER COLUMN "USEN_ID" SET DEFAULT nextval('public."USER_USEN_ID_seq"'::regclass);


--
-- Data for Name: ACCOMMODATION; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ACCOMMODATION" ("ACCN_ID", "ACCC_NAME", "ACCC_TYPE", "ACCC_DESC", "ACCC_ADDRESS", "ACCB_AVAILABLE", "USEN_ID") FROM stdin;
3	Studio meublé proche fac	Appartement	Studio idéal pour étudiant, entièrement équipé.	8 rue de lUniversité, 69100 Villeurbanne	t	1
5	House n°5	House	Tema la taille de la modif.	123 rue de la modif	t	1
1	Appartement cosy centre-ville	Appartement	Charmant T2 entièrement rénové.	16 rue du Centre, 75002 Paris	t	1
2	Maison avec jardin au calme	Maison	Grande maison familiale avec jardin et terrasse.	20 avenue de la Gare, 33000 Bordeaux	f	1
4	Loft industriel avec vue	Appartement	Spacieux loft avec de grandes baies vitrées.	1 rue des Ateliers, 13000 Marseille	f	1
\.


--
-- Data for Name: EVENT; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."EVENT" ("EVEN_ID", "EVEC_LIB", "EVED_START", "EVED_END", "USEN_ID", "ACCN_ID") FROM stdin;
1	Visite appartement T2	2025-05-10 14:00:00	2025-05-10 15:00:00	1	1
2	Réparation toiture	2025-05-15 09:00:00	2025-05-15 12:00:00	1	2
4	Assemblée générale des copropriétaires	2025-07-20 18:00:00	2025-07-20 21:00:00	1	1
5	Nettoyage des parties communes	2025-05-25 08:00:00	2025-05-25 10:00:00	1	2
3	État des lieux sortie locataire + test	2025-06-01 10:30:00	2025-06-01 11:30:00	1	3
11	Test ISO	2025-06-01 09:00:00	2025-06-01 11:00:00	99	99
12	Test multi-jours	2025-08-01 09:00:00	2025-08-03 18:00:00	101	101
13	Test split	2025-07-10 14:00:00	2025-07-10 16:00:00	100	100
\.


--
-- Data for Name: LEASE; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LEASE" ("LEAN_ID", "LEAD_START", "LEAD_END", "LEAN_RENT", "LEAN_CHARGES", "LEAD_PAYMENT", "LEAB_ACTIVE", "USEN_ID", "ACCN_ID") FROM stdin;
1	2024-09-01	2025-08-31	1200.00	150.00	2025-05-01	t	2	1
2	2024-10-15	2025-10-14	650.00	50.00	2025-05-03	t	3	3
3	2025-01-01	2025-06-30	900.00	100.00	2025-05-02	f	4	4
\.


--
-- Data for Name: MESSAGE; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MESSAGE" ("MESN_ID", "MESN_RECEIVER", "MESN_SENDER", "MESC_CONTENT", "MESD_DATE", "MESB_NEW") FROM stdin;
1	2	1	Bonjour Sophie, la visite est confirmée pour samedi à 14h.	2025-05-07 10:00:00	t
2	1	2	Parfait, à samedi !	2025-05-07 10:15:00	f
3	3	1	Bonjour Pierre, noubliez pas votre dossier pour la visite.	2025-05-08 15:30:00	t
4	1	3	Bien reçu, merci.	2025-05-08 15:45:00	f
5	4	1	Bonjour Julie, comment sest passée votre installation ?	2025-05-03 18:00:00	f
11	2	1	Hello from test!	2025-05-10 18:42:52.377457	t
12	2	1	Hello from test!	2025-05-11 11:49:51.400673	t
13	2	1	Hello from test!	2025-05-11 19:07:03.259	t
14	2	1	Hello from test!	2025-05-11 19:12:29.66	t
15	2	1	Hello from test!	2025-05-11 19:22:41.488	t
16	2	1	Hello	2025-05-13 20:23:44.56482	f
17	2	1	Hello	2025-05-13 20:24:24.630149	f
18	2	1	Hello	2025-05-13 20:26:12.921835	f
19	2	1	Hello, world!	2025-05-13 21:18:31.25552	f
20	2	1	Hello, world!	2025-05-13 21:19:43.809272	f
\.


--
-- Data for Name: USER; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."USER" ("USEN_ID", "USEC_URLPP", "USEC_LNAME", "USEC_FNAME", "USEC_TYPE", "USEC_BIO", "USED_BIRTH", "USEC_TEL", "USEC_ADDRESS", "USEC_MAIL", "USEC_PASSWORD", "USEN_INVITE") FROM stdin;
1	https://example.com/photo_owner.jpg	Maxime	TestName	OWNER	Passionné dimmobilier et de voyages.	1980-05-15	0612345678	10 rue de la Paix, 75001 Paris	jean.dupont@example.com	motdepasse1	\N
2	https://example.com/photo_tenant1.jpg	Martin	Sophie	TENANT	À la recherche dun appartement confortable.	1992-08-22	0798765432	5 avenue des Fleurs, 69000 Lyon	sophie.martin@example.com	securepass2	1
3	https://example.com/photo_tenant2.jpg	Lefevre	Pierre	TENANT	Étudiant calme et respectueux.	2001-03-10	0655555555	12 boulevard Carnot, 59000 Lille	pierre.lefevre@example.com	password3	1
4	https://example.com/photo_tenant3.jpg	Dubois	Julie	TENANT	Jeune active, aimant les animaux.	1995-06-28	0711223344	7 rue Voltaire, 44000 Nantes	julie.dubois@example.com	juliette	1
\.


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
-- Name: ACCOMMODATION ACCOMMODATION_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ACCOMMODATION"
    ADD CONSTRAINT "ACCOMMODATION_pkey" PRIMARY KEY ("ACCN_ID");


--
-- Name: EVENT EVENT_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EVENT"
    ADD CONSTRAINT "EVENT_pkey" PRIMARY KEY ("EVEN_ID");


--
-- Name: LEASE LEASE_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LEASE"
    ADD CONSTRAINT "LEASE_pkey" PRIMARY KEY ("LEAN_ID");


--
-- Name: MESSAGE MESSAGE_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MESSAGE"
    ADD CONSTRAINT "MESSAGE_pkey" PRIMARY KEY ("MESN_ID");


--
-- Name: USER USER_USEC_MAIL_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."USER"
    ADD CONSTRAINT "USER_USEC_MAIL_key" UNIQUE ("USEC_MAIL");


--
-- Name: USER USER_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."USER"
    ADD CONSTRAINT "USER_pkey" PRIMARY KEY ("USEN_ID");


--
-- Name: ACCOMMODATION fk_accommodation_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ACCOMMODATION"
    ADD CONSTRAINT fk_accommodation_user FOREIGN KEY ("USEN_ID") REFERENCES public."USER"("USEN_ID") ON DELETE CASCADE;


--
-- Name: USER fk_invite_owner; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."USER"
    ADD CONSTRAINT fk_invite_owner FOREIGN KEY ("USEN_INVITE") REFERENCES public."USER"("USEN_ID") ON DELETE SET NULL;


--
-- Name: LEASE fk_lease_accommodation; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LEASE"
    ADD CONSTRAINT fk_lease_accommodation FOREIGN KEY ("ACCN_ID") REFERENCES public."ACCOMMODATION"("ACCN_ID") ON DELETE CASCADE;


--
-- Name: LEASE fk_lease_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LEASE"
    ADD CONSTRAINT fk_lease_user FOREIGN KEY ("USEN_ID") REFERENCES public."USER"("USEN_ID") ON DELETE CASCADE;


--
-- Name: MESSAGE fk_message_receiver; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MESSAGE"
    ADD CONSTRAINT fk_message_receiver FOREIGN KEY ("MESN_RECEIVER") REFERENCES public."USER"("USEN_ID") ON DELETE CASCADE;


--
-- Name: MESSAGE fk_message_sender; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MESSAGE"
    ADD CONSTRAINT fk_message_sender FOREIGN KEY ("MESN_SENDER") REFERENCES public."USER"("USEN_ID") ON DELETE CASCADE;


--
-- Name: USER fk_user_invite; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."USER"
    ADD CONSTRAINT fk_user_invite FOREIGN KEY ("USEN_INVITE") REFERENCES public."USER"("USEN_ID") ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

