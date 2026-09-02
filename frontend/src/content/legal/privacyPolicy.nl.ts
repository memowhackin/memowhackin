import {
  anchor,
  external,
  gap,
  list,
  mail,
  note,
  p,
  records,
  route,
  type LegalDocument,
} from "./types";

/*
 * De Nederlandse tekst van het privacybeleid. Zelfde opbouw, zelfde sectie-ids
 * als de Engelse versie — een test bewaakt dat de twee niet uit elkaar lopen.
 */

const CONTACT = mail("contact@assistsec.nl", "contact@assistsec.nl");

export const privacyPolicyNl: LegalDocument = {
  kind: "privacyPolicy",
  locale: "nl",
  title: "Privacybeleid",
  lede: "Hoe AssistSec omgaat met persoonsgegevens wanneer u assistsec.nl bezoekt, de gratis exposure-scanner gebruikt of contact met ons opneemt. Geschreven naar wat deze website werkelijk doet, in gewone taal.",
  updatedAt: "2026-09-02",
  version: "1.0",
  gaps: {
    legalEntity:
      "volledige juridische naam en rechtsvorm van de onderneming (bijv. B.V.)",
    chamberOfCommerce: "KvK-nummer",
    address: "statutair adres / vestigingsadres",
    dpo: "of er een functionaris voor gegevensbescherming is aangesteld, en diens contactgegevens",
    hostingProvider:
      "naam en locatie van de hosting- en infrastructuurleverancier(s)",
    logRetention: "bewaartermijn van server- en toegangslogs",
    mailProvider: "naam en locatie van de e-mailprovider",
    contactRetention: "bewaartermijn voor per e-mail ontvangen vragen",
    scanRetentionProduction:
      "bevestiging van de in productie ingestelde bewaartermijn voor rapporten",
    scanPurge:
      "schema waarop verlopen scangegevens daadwerkelijk worden verwijderd (er is nog geen automatische opruiming ingericht)",
    leadRetention:
      "bewaartermijn voor de zakelijke gegevens die worden achtergelaten om een rapport te ontgrendelen",
    newsletterField:
      "besluit over het nieuwsbriefveld bij blogartikelen: koppelen aan een mailingdienst en die verwerking hier beschrijven, of het veld verwijderen",
    portalPrivacyNotice:
      "link naar de privacyverklaring van het ARGUS-klantportaal (scanner.assistsec.nl)",
    aiProviders:
      "de AI-/LLM-leveranciers die bij pentestopdrachten worden ingezet en de voorwaarden waaronder zij klantgegevens verwerken (relevant voor klantovereenkomsten, hier voor de volledigheid genoemd)",
  },
  sections: [
    {
      id: "who-we-are",
      title: "Wie wij zijn en hoe u ons bereikt",
      blocks: [
        p(
          "AssistSec is een Nederlands cybersecuritybedrijf. Wij voeren penetratietesten uit op webapplicaties en API's en combineren daarbij het oordeel van ervaren pentesters met een AI-ondersteunde testmotor. Dit beleid wordt uitgegeven door ",
          gap("legalEntity"),
          ", ingeschreven bij de Kamer van Koophandel onder nummer ",
          gap("chamberOfCommerce"),
          ", gevestigd te ",
          gap("address"),
          ". Voor de verwerkingen in dit beleid zijn wij de verwerkingsverantwoordelijke in de zin van de Algemene verordening gegevensbescherming (AVG).",
        ),
        records(
          {
            term: "Website",
            detail: [
              "assistsec.nl (Engels) en assistsec.nl/nl (Nederlands). Elke taal is een aparte build van dezelfde site.",
            ],
          },
          { term: "E-mail", detail: [CONTACT] },
          {
            term: "Functionaris voor gegevensbescherming",
            detail: [gap("dpo")],
          },
        ),
      ],
    },
    {
      id: "scope",
      title: "Waarop dit beleid van toepassing is",
      blocks: [
        p(
          "Dit beleid geldt voor de openbare website, voor de gratis digitale exposure-scanner op ",
          route("assistsec.nl/security-scan", "/security-scan"),
          " en voor de communicatie die u via de site of per e-mail met ons heeft.",
        ),
        p("Het geldt niet voor:"),
        list(
          [
            "het ARGUS-klantportaal op scanner.assistsec.nl, waar de knoppen voor inloggen, een demo en registratie op deze site naartoe leiden. Het portaal is een aparte dienst met een eigen privacyverklaring: ",
            gap("portalPrivacyNotice"),
            ".",
          ],
          [
            "persoonsgegevens die wij verwerken bij het uitvoeren van een penetratietest of andere opdracht voor een klant. Die verwerking wordt beheerst door de opdrachtovereenkomst en, waar wij als verwerker optreden, door een verwerkersovereenkomst.",
          ],
        ),
        note(
          "Deze website gebruikt geen analytics-, advertentie- of trackingtechnologie, plaatst zelf geen cookies en bouwt geen profielen van bezoekers op. Wij verkopen of verhuren geen persoonsgegevens.",
        ),
      ],
    },
    {
      id: "processing",
      title: "Wat wij verwerken, waarom en hoe lang",
      blocks: [
        p(
          "De website doet een beperkt aantal dingen. Elk daarvan staat hieronder beschreven met de betrokken gegevens, het doel, de grondslag onder artikel 6 AVG en de bewaartermijn.",
        ),
      ],
      subsections: [
        {
          id: "visiting",
          title: "Bezoek aan de website",
          blocks: [
            p(
              "De site wordt geleverd als vooraf gerenderde pagina's. Zoals elke website wordt zij geserveerd door infrastructuur die technische logs bijhoudt van de verzoeken die zij ontvangt.",
            ),
            records(
              {
                term: "Gegevens",
                detail: [
                  "IP-adres, kenmerken van browser en apparaat, de opgevraagde pagina's, de verwijzende pagina en het tijdstip van het verzoek, zoals vastgelegd in de serverlogs van de infrastructuur die de site serveert.",
                ],
              },
              {
                term: "Doel",
                detail: [
                  "Het leveren van de pagina's die u opvraagt, het beschikbaar en veilig houden van de site, het herkennen van misbruik en het opsporen van storingen.",
                ],
              },
              {
                term: "Grondslag",
                detail: [
                  "Ons gerechtvaardigd belang bij een veilige en betrouwbare website (artikel 6 lid 1 onder f AVG).",
                ],
              },
              { term: "Bewaartermijn", detail: [gap("logRetention")] },
              {
                term: "Ontvangers",
                detail: [
                  "Onze hostingleverancier: ",
                  gap("hostingProvider"),
                  ".",
                ],
              },
            ),
          ],
        },
        {
          id: "fonts",
          title: "Webfonts",
          blocks: [
            p(
              "De lettertypen van de site (Inter en Geist Mono) worden geladen via Google Fonts. Wanneer uw browser ze ophaalt, maakt hij verbinding met servers van Google LLC, dat daarbij uw IP-adres en de technische details van het verzoek ontvangt. Google verklaart dat Fonts-verzoeken niet worden gebruikt om cookies te plaatsen of advertentieprofielen op te bouwen.",
            ),
            records(
              {
                term: "Grondslag",
                detail: [
                  "Ons gerechtvaardigd belang bij consistente, snel ladende typografie (artikel 6 lid 1 onder f AVG).",
                ],
              },
              {
                term: "Doorgifte",
                detail: [
                  "Google LLC is gevestigd in de Verenigde Staten en is gecertificeerd onder het EU-VS Data Privacy Framework. Zie ook ",
                  anchor("Doorgifte buiten de EER", "transfers"),
                  ".",
                ],
              },
            ),
          ],
        },
        {
          id: "contact",
          title: "Contact met ons opnemen",
          blocks: [
            p(
              "Het contactformulier op ",
              route("assistsec.nl/contact", "/contact"),
              " verstuurt niets naar onze servers. Bij verzenden opent het een bericht in uw eigen e-mailprogramma, gericht aan ons, met de naam, het e-mailadres, het bedrijf, de gekozen dienst en het bericht dat u hebt ingevuld. De website zelf bewaart niets; het bericht bereikt ons pas wanneer u het verzendt.",
            ),
            records(
              {
                term: "Gegevens",
                detail: [
                  "Uw naam, e-mailadres, bedrijf (indien opgegeven), de dienst waarnaar u vroeg en de inhoud van uw bericht, plus de technische e-mailheaders.",
                ],
              },
              {
                term: "Doel",
                detail: [
                  "Het beantwoorden van uw vraag en, waar relevant, het opstellen van een voorstel.",
                ],
              },
              {
                term: "Grondslag",
                detail: [
                  "Het op uw verzoek nemen van maatregelen voorafgaand aan een overeenkomst (artikel 6 lid 1 onder b AVG), of anders ons gerechtvaardigd belang bij het afhandelen van vragen (artikel 6 lid 1 onder f).",
                ],
              },
              { term: "Bewaartermijn", detail: [gap("contactRetention")] },
              {
                term: "Ontvangers",
                detail: ["Onze e-mailprovider: ", gap("mailProvider"), "."],
              },
            ),
          ],
        },
        {
          id: "scanner",
          title: "De gratis exposure-scanner",
          blocks: [
            p(
              "Op ",
              route("assistsec.nl/security-scan", "/security-scan"),
              " kunt u een websitedomein invoeren en een overzicht ontvangen van de publiek zichtbare beveiligingsblootstelling ervan. De scan is passief: er wordt alleen gekeken naar wat iedereen op internet over het domein kan waarnemen. Wij sturen geen aanvalsverkeer, wij loggen niet in en wij testen geen bedrijfslogica.",
            ),
            p("Waar de scan naar kijkt:"),
            list(
              [
                "DNS-records, waaronder DNSSEC en certificaatautoriteit-autorisatie (CAA).",
              ],
              ["Het TLS-certificaat en de TLS-handshake van het domein."],
              [
                "HTTP-responsheaders en de vlaggen op cookies die de site plaatst (beveiligingsheaders, HTTPS-redirects, HSTS).",
              ],
              ["E-mailauthenticatierecords: SPF, DMARC en MTA-STS."],
              [
                "Hostnamen die voor het domein zijn gepubliceerd in openbare Certificate Transparency-logs.",
              ],
              [
                "Geregistreerde domeinen die op het domein lijken (lookalikes), en of die e-mail kunnen ontvangen.",
              ],
              [
                "Bekende bestanden die de site publiceert (robots.txt, security.txt en vergelijkbare), directory-listings, de afbeeldingen op de homepage en de technologieën die de site over zichzelf bekendmaakt.",
              ],
            ),
            records(
              {
                term: "Gegevens die wij opslaan",
                detail: [
                  "Het domein dat u invoerde, versleuteld opgeslagen (AES-256-GCM) samen met een gesleutelde vingerafdruk die uitsluitend dient om een herhaald verzoek voor hetzelfde domein binnen vijf minuten te herkennen; de status van de scan; de resultaten, zijnde waarnemingen over het domein zoals hierboven opgesomd, waaruit gevoelig bewijs zoals paden en versiebanners is verwijderd; de taal van de pagina die u gebruikte; en tijdstempels.",
                ],
              },
              {
                term: "Gegevens die wij niet opslaan",
                detail: [
                  "Uw IP-adres wordt niet bij de scan vastgelegd. Het wordt uitsluitend in het geheugen gebruikt om het aantal scans per verbinding te begrenzen (acht per tien minuten) en wordt niet bewaard. De scan is niet gekoppeld aan een account of aan u; niemand logt in om een scan te starten.",
                ],
              },
              {
                term: "Doel",
                detail: [
                  "Het opstellen van het rapport dat u aanvroeg en het tonen daarvan aan wie de link heeft.",
                ],
              },
              {
                term: "Grondslag",
                detail: [
                  "Uitvoering van de dienst die u aanvraagt (artikel 6 lid 1 onder b AVG). Een domeinnaam is doorgaans informatie over een organisatie en niet over een persoon; waar zij een natuurlijke persoon identificeert, beroepen wij ons op ons gerechtvaardigd belang bij het leveren van de door u gevraagde controle (artikel 6 lid 1 onder f).",
                ],
              },
              {
                term: "Bewaartermijn",
                detail: [
                  "Een rapport is 72 uur na aanmaak leesbaar (",
                  gap("scanRetentionProduction"),
                  "). Daarna meldt de link dat het rapport is verlopen. Verlopen gegevens worden verwijderd: ",
                  gap("scanPurge"),
                  ".",
                ],
              },
              {
                term: "Wie het rapport kan lezen",
                detail: [
                  "Iedereen die de link heeft. De rapport-identificatie is willekeurig en komt nergens anders voor, maar de link is de enige bescherming; behandel hem dus als het rapport zelf.",
                ],
              },
            ),
            p(
              "Om de scan uit te voeren sturen onze servers de domeinnaam naar een aantal derden: openbare DNS-resolvers, de webservers van het domein zelf, de Certificate Transparency-zoekdiensten crt.sh en Cert Spotter (SSLMate, Inc., Verenigde Staten) en de hostzoekdienst van HackerTarget (HackerTarget, Australië). Deze partijen ontvangen de domeinnaam en het adres van onze server, niet het uwe.",
            ),
            p(
              "Scan alleen domeinen die van u zijn of die u mag beoordelen; zie onze ",
              route("Algemene voorwaarden", "/terms-of-service"),
              ". De hostnamen die een rapport noemt komen uit openbare certificaatlogs en zijn al openbaar. Bewijs dat een aanval zou verkorten, zoals leesbare paden en versiebanners, wordt verwijderd voordat iets wordt opgeslagen.",
            ),
            p(
              "De scanner is ook gebouwd om persoonlijke e-mail-exposurerapporten te maken, geleverd via een eenmalige link die naar het betreffende adres wordt gestuurd. Die dienst is op dit moment niet beschikbaar. Zouden wij haar aanbieden, dan beschrijven wij de verwerking eerst in dit beleid.",
            ),
          ],
        },
        {
          id: "unlock",
          title: "Een volledig rapport ontgrendelen",
          blocks: [
            p(
              "Een websiterapport toont zijn belangrijkste bevindingen aan iedereen. Om alle bevindingen te zien vragen wij om uw zakelijke gegevens. Dat is een commerciële keuze van onze kant, geen beveiligingsmaatregel: het rapport betreft de publieke blootstelling van een domein, en de gegevens die u achterlaat vertellen ons wie belangstelling heeft voor onze diensten.",
            ),
            records(
              {
                term: "Gegevens",
                detail: [
                  "Uw naam, bedrijf, functie en zakelijke e-mailadres, samen met de identificatie van de scan en het tijdstip waarop u het formulier verzond. Persoonlijke webmailadressen worden geweigerd; een bedrijfsadres is vereist.",
                ],
              },
              {
                term: "Doel",
                detail: [
                  "U toegang geven tot het volledige rapport en na uw scan contact met u opnemen over onze diensten.",
                ],
              },
              {
                term: "Grondslag",
                detail: [
                  "Uw toestemming, gegeven door ervoor te kiezen de gegevens te verstrekken (artikel 6 lid 1 onder a AVG), die u op elk moment kunt intrekken; en ons gerechtvaardigd belang bij het opvolgen van zakelijke interesse (artikel 6 lid 1 onder f). U kunt op elk moment bezwaar maken tegen opvolging door te schrijven naar ",
                  CONTACT,
                  ".",
                ],
              },
              {
                term: "Opslag",
                detail: [
                  "Leesbaar opgeslagen in onze database en zichtbaar voor geautoriseerde AssistSec-medewerkers in ons contentmanagementsysteem. De gegevens blijven bewaard nadat de bijbehorende scan is verlopen.",
                ],
              },
              { term: "Bewaartermijn", detail: [gap("leadRetention")] },
              {
                term: "Ontvangers",
                detail: [
                  "Niemand buiten AssistSec, afgezien van de hostingleverancier die onze database beheert.",
                ],
              },
            ),
            p(
              "Zodat het rapport ontgrendeld blijft terwijl u het open heeft, legt uw browser in de sessieopslag een vlag vast onder de naam scanner:unlocked gevolgd door de scan-identificatie. Die bevat geen persoonsgegevens en verdwijnt wanneer u het tabblad sluit.",
            ),
          ],
        },
        {
          id: "blog",
          title: "Blog, feed en delen",
          blocks: [
            p(
              "Artikelen worden geladen uit ons eigen contentmanagementsysteem. Het lezen ervan brengt geen andere gegevens met zich mee dan de technische logs beschreven onder ",
              anchor("Bezoek aan de website", "visiting"),
              ". Hetzelfde geldt voor de RSS-feed.",
            ),
            p(
              "De deelknop bij een artikel opent LinkedIn met het adres van het artikel; vanaf dat moment geldt het privacybeleid van LinkedIn. Een link kopiëren gebruikt het klembord van uw browser en stuurt niets naar ons.",
            ),
            p(
              "Bij artikelen staat een veld om u op een nieuwsbrief te abonneren. Op dit moment verstuurt of bewaart dat veld uw adres niet en wordt er geen nieuwsbrief verzonden. ",
              gap("newsletterField"),
              ".",
            ),
          ],
        },
        {
          id: "external",
          title: "Links naar andere diensten",
          blocks: [
            p(
              "De site verwijst naar diensten die wij niet als onderdeel van deze site exploiteren: het ARGUS-klantportaal op scanner.assistsec.nl voor inloggen, het boeken van een demo en het aanmaken van een account (",
              gap("portalPrivacyNotice"),
              "), onze bedrijfspagina's op LinkedIn en YouTube, en Google Fonts zoals hierboven beschreven. Zodra u zo'n link volgt, geldt de privacyverklaring van die dienst.",
            ),
          ],
        },
        {
          id: "staff",
          title: "Onze eigen redacteuren",
          blocks: [
            p(
              "Artikelen en scanner-leads worden beheerd in een beheeromgeving waarop alleen geautoriseerde AssistSec-medewerkers kunnen inloggen. Voor hen houden wij een inlogsessie bij, waarin het gebruikte IP-adres en de browser worden vastgelegd, en een auditlog van de handelingen die zij verrichten. Dit is een beveiligingsmaatregel voor de site; zij betreft onze eigen mensen, niet bezoekers.",
            ),
          ],
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies en lokale opslag",
      blocks: [
        p(
          "De openbare website plaatst geen cookies, en geen derde plaatst cookies via de site. Er is geen cookiebanner, omdat er niets is om toestemming voor te vragen.",
        ),
        records(
          {
            term: "Sessieopslag",
            detail: [
              "Eén functionele vlag, scanner:unlocked plus de scan-identificatie, die uw browser bewaart nadat u een rapport hebt ontgrendeld zodat het in dat tabblad ontgrendeld blijft. Verwijderd wanneer het tabblad sluit. Bevat geen persoonsgegevens.",
            ],
          },
          {
            term: "Beheersessiecookie",
            detail: [
              "Wordt alleen geplaatst wanneer een AssistSec-redacteur inlogt op de beheeromgeving. Bezoekers ontvangen deze nooit.",
            ],
          },
          {
            term: "Google Fonts",
            detail: ["Plaatst geen cookies."],
          },
        ),
      ],
    },
    {
      id: "recipients",
      title: "Wie uw gegevens ontvangt",
      blocks: [
        p(
          "Uw gegevens worden alleen gedeeld met de partijen die nodig zijn om het bovenstaande uit te voeren:",
        ),
        list(
          [
            "onze hosting- en infrastructuurleverancier, die de website, de database en de scanner draait: ",
            gap("hostingProvider"),
            ";",
          ],
          [
            "onze e-mailprovider, voor berichten die u ons stuurt: ",
            gap("mailProvider"),
            ";",
          ],
          [
            "Google LLC, voor de webfonts, zoals beschreven onder ",
            anchor("Webfonts", "fonts"),
            ";",
          ],
          [
            "de DNS-resolvers, doelwebservers en Certificate Transparency-diensten die de scanner raadpleegt en die uitsluitend een domeinnaam ontvangen;",
          ],
          [
            "overheidsinstanties, waar wij wettelijk verplicht zijn gegevens te verstrekken of onze rechten moeten beschermen.",
          ],
        ),
        p(
          "Waar een leverancier persoonsgegevens namens ons verwerkt, hebben wij met die partij een verwerkersovereenkomst. Wij verkopen geen persoonsgegevens en delen ze niet voor de marketing van anderen.",
        ),
        p(
          "Deze website gebruikt geen kunstmatige intelligentie om gegevens over bezoekers te verwerken. Onze pentestdiensten gebruiken wél AI-modellen, onder menselijk toezicht; hoe klantgegevens daarbij worden behandeld staat in de opdrachtovereenkomst en de verwerkersovereenkomst met de klant (",
          gap("aiProviders"),
          ").",
        ),
      ],
    },
    {
      id: "transfers",
      title: "Doorgifte buiten de EER",
      blocks: [
        p(
          "Wij streven ernaar persoonsgegevens binnen de Europese Economische Ruimte te houden. Twee uitzonderingen volgen uit de opbouw van de site:",
        ),
        list(
          [
            "Google LLC (Verenigde Staten) ontvangt uw IP-adres wanneer uw browser de webfonts laadt. Google is gecertificeerd onder het EU-VS Data Privacy Framework, dat de Europese Commissie heeft erkend als passend beschermingsniveau.",
          ],
          [
            "Wanneer u een scan uitvoert, wordt de ingevoerde domeinnaam als onderdeel van de opzoekingen verzonden naar SSLMate, Inc. (Verenigde Staten) en HackerTarget (Australië). Deze partijen ontvangen geen gegevens over u.",
          ],
        ),
        p(
          "De locatie van onze hostingleverancier staat hierboven: ",
          gap("hostingProvider"),
          ".",
        ),
      ],
    },
    {
      id: "security",
      title: "Hoe wij gegevens beschermen",
      blocks: [
        p(
          "De site en haar diensten zijn onder meer met de volgende maatregelen gebouwd:",
        ),
        list(
          [
            "Al het verkeer naar de site en haar API is onderweg versleuteld (HTTPS).",
          ],
          [
            "Scanonderwerpen en scanresultaten worden in rust versleuteld met AES-256-GCM; de sleutel wordt buiten de database bewaard.",
          ],
          [
            "Scanrapporten hebben een willekeurige identificatie, worden nooit gecachet en zijn uitgesloten van zoekmachines.",
          ],
          [
            "Verzoeken aan de scanner zijn per verbinding begrensd, en domeinen die naar privé- of interne adressen verwijzen worden geweigerd.",
          ],
          [
            "Toegang tot de beheeromgeving vereist een wachtwoord dat met argon2id is opgeslagen, gebruikt serverzijdige sessies die kunnen worden ingetrokken en is beschermd tegen cross-site request forgery. Handelingen van redacteuren worden gelogd.",
          ],
          [
            "De resultaten die de scanner opslaat bevatten nooit wachtwoorden, in welke vorm dan ook, en bewijs dat een aanvaller zou helpen wordt vóór opslag verwijderd.",
          ],
        ),
      ],
    },
    {
      id: "rights",
      title: "Uw rechten",
      blocks: [
        p("Onder de AVG heeft u het recht om:"),
        list(
          [
            "de persoonsgegevens die wij over u hebben in te zien en er een kopie van te ontvangen;",
          ],
          [
            "onjuiste gegevens te laten corrigeren en onvolledige gegevens te laten aanvullen;",
          ],
          [
            "uw gegevens te laten wissen wanneer er voor ons geen reden meer is ze te bewaren;",
          ],
          [
            "de verwerking te laten beperken, in de gevallen waarin de wet dat voorziet;",
          ],
          [
            "de gegevens die u ons hebt verstrekt te ontvangen in een gestructureerd, gangbaar formaat (overdraagbaarheid);",
          ],
          [
            "bezwaar te maken tegen verwerking op grond van ons gerechtvaardigd belang, en op elk moment bezwaar te maken tegen direct marketing;",
          ],
          [
            "gegeven toestemming in te trekken, zonder dat dit de rechtmatigheid van de verwerking vóór de intrekking aantast.",
          ],
        ),
        p(
          "Om een van deze rechten uit te oefenen schrijft u naar ",
          CONTACT,
          ". Wij reageren binnen een maand; bij een complex verzoek kunnen wij die termijn met twee maanden verlengen en laten u dat dan weten. Wij kunnen u vragen uw identiteit te bevestigen voordat wij een verzoek uitvoeren, zodat wij uw gegevens niet aan een ander afgeven.",
        ),
        p(
          "Meent u dat wij uw persoonsgegevens onrechtmatig hebben verwerkt, dan kunt u een klacht indienen bij de Nederlandse toezichthouder, de Autoriteit Persoonsgegevens (",
          external(
            "autoriteitpersoonsgegevens.nl",
            "https://www.autoriteitpersoonsgegevens.nl",
          ),
          "). Wij stellen het op prijs als u ons eerst de kans geeft uw zorg op te lossen.",
        ),
      ],
    },
    {
      id: "children",
      title: "Kinderen",
      blocks: [
        p(
          "Deze website en haar diensten zijn gericht op organisaties en professionals, niet op kinderen. Wij verzamelen niet bewust persoonsgegevens van personen jonger dan 16 jaar. Denkt u dat een kind ons persoonsgegevens heeft verstrekt, neem dan contact met ons op; wij verwijderen ze.",
        ),
      ],
    },
    {
      id: "automated-decisions",
      title: "Geautomatiseerde besluitvorming",
      blocks: [
        p(
          "Wij nemen geen besluiten over u die uitsluitend op geautomatiseerde verwerking zijn gebaseerd en rechtsgevolgen of vergelijkbaar ingrijpende gevolgen hebben. De score van de scanner beschrijft de technische blootstelling van een domein op één moment; zij is informatief en zegt niets over een persoon.",
        ),
      ],
    },
    {
      id: "changes",
      title: "Wijzigingen in dit beleid",
      blocks: [
        p(
          "Wij passen dit beleid aan wanneer de site verandert op een manier die uw gegevens raakt, of wanneer de wet dat vereist. De datum en het versienummer bovenaan tonen de actuele tekst. Bij een wezenlijke wijziging vestigen wij daar op de site de aandacht op.",
        ),
      ],
    },
    {
      id: "contact-us",
      title: "Contact",
      blocks: [
        p(
          "Vragen over dit beleid of over uw gegevens kunt u sturen naar ",
          CONTACT,
          " of naar ons postadres: ",
          gap("address"),
          ".",
        ),
      ],
    },
  ],
};
