import { gap, list, mail, note, p, route, type LegalDocument } from "./types";

/*
 * De Nederlandse tekst van de algemene voorwaarden voor de website en de gratis
 * scanner. Zelfde opbouw en sectie-ids als de Engelse versie.
 */

const CONTACT = mail("contact@assistsec.nl", "contact@assistsec.nl");

export const termsOfServiceNl: LegalDocument = {
  kind: "termsOfService",
  locale: "nl",
  title: "Algemene voorwaarden",
  lede: "De voorwaarden die gelden wanneer u assistsec.nl en de gratis exposure-scanner gebruikt. Penetratietesten, abonnementen en het ARGUS-portaal vallen onder een afzonderlijke schriftelijke overeenkomst.",
  updatedAt: "2026-09-02",
  version: "1.0",
  gaps: {
    legalEntity:
      "volledige juridische naam en rechtsvorm van de onderneming (bijv. B.V.)",
    chamberOfCommerce: "KvK-nummer",
    vatNumber: "btw-identificatienummer",
    address: "statutair adres / vestigingsadres",
    generalTerms:
      "of op betaalde diensten afzonderlijke algemene (leverings)voorwaarden van toepassing zijn, en waar die te vinden zijn",
    portalTerms:
      "link naar de gebruiksvoorwaarden van het ARGUS-klantportaal (scanner.assistsec.nl)",
    liabilityCap:
      "het bedrag waartoe de aansprakelijkheid is beperkt waar zij niet kan worden uitgesloten",
    competentCourt: "de bevoegde rechter (bijv. de rechtbank …)",
    prevailingLanguage:
      "welke taalversie voorgaat als de Engelse en Nederlandse tekst van elkaar afwijken",
  },
  sections: [
    {
      id: "who-we-are",
      title: "Wie wij zijn",
      blocks: [
        p(
          "Deze voorwaarden zijn die van ",
          gap("legalEntity"),
          ", handelend onder de naam AssistSec, ingeschreven bij de Kamer van Koophandel onder nummer ",
          gap("chamberOfCommerce"),
          ", btw-nummer ",
          gap("vatNumber"),
          ", gevestigd te ",
          gap("address"),
          '. In deze voorwaarden verwijzen "wij", "ons" en "AssistSec" naar die onderneming, en "u" naar iedereen die de website of de scanner gebruikt.',
        ),
        p("U bereikt ons via ", CONTACT, "."),
      ],
    },
    {
      id: "applicability",
      title: "Wanneer deze voorwaarden gelden",
      blocks: [
        p(
          "Deze voorwaarden gelden voor uw gebruik van de website op assistsec.nl, inclusief de Nederlandse versie op assistsec.nl/nl, en van de gratis digitale exposure-scanner op ",
          route("assistsec.nl/security-scan", "/security-scan"),
          ". Door de website of de scanner te gebruiken aanvaardt u ze. Gaat u niet akkoord, gebruik ze dan niet.",
        ),
        p("Deze voorwaarden gelden niet voor:"),
        list(
          [
            "onze betaalde diensten: penetratietesten, maandelijkse scans en andere opdrachten. Die worden uitgevoerd onder een schriftelijke overeenkomst met de klant, waarin de scope, de te testen systemen, de testperiode, de prijs en de toepasselijke voorwaarden zijn vastgelegd. Bij die overeenkomst horen doorgaans een vrijwaringsbrief met toestemming tot testen en een geheimhoudingsovereenkomst. ",
            gap("generalTerms"),
            ".",
          ],
          [
            "het ARGUS-klantportaal op scanner.assistsec.nl, waar de knoppen voor inloggen, een demo en registratie op deze site naartoe leiden. Het gebruik van het portaal wordt beheerst door de klantovereenkomst en de eigen gebruiksvoorwaarden van het portaal: ",
            gap("portalTerms"),
            ".",
          ],
        ),
        p(
          "Waar zo'n overeenkomst en deze voorwaarden met elkaar in strijd zijn, gaat de overeenkomst voor. Bent u consument, dan beperkt niets in deze voorwaarden de rechten die u op grond van dwingend recht heeft.",
        ),
      ],
    },
    {
      id: "website",
      title: "Gebruik van de website",
      blocks: [
        p(
          "De website beschrijft onze diensten en publiceert artikelen over beveiliging. De inhoud is bedoeld als algemene informatie. Zij is geen juridisch, beveiligings- of ander professioneel advies en geen aanbod: de voorwaarden van een opdracht worden schriftelijk overeengekomen. Voorbeelden van de interface op de site, zoals portaalschermen, zijn illustraties en kunnen voorbeeldgegevens bevatten.",
        ),
        p(
          "Wij kunnen elk onderdeel van de website op elk moment zonder aankondiging wijzigen, opschorten of beëindigen. Wij streven ernaar de site beschikbaar en juist te houden, maar garanderen geen van beide.",
        ),
        p("Bij het gebruik van de website mag u niet:"),
        list(
          [
            "haar gebruiken voor een onrechtmatig doel of in strijd met deze voorwaarden;",
          ],
          [
            "proberen toegang te krijgen tot delen van de site of haar systemen die niet voor u bestemd zijn, waaronder de beheeromgeving, die uitsluitend voor AssistSec-medewerkers is;",
          ],
          [
            "de site, haar API of de infrastructuur waarop zij draait aanvallen, aftasten, overbelasten of anderszins verstoren;",
          ],
          [
            "inhoud op grote schaal geautomatiseerd overnemen, anders dan via de RSS-feed en de sitemap die wij daarvoor publiceren;",
          ],
          [
            "een onjuiste voorstelling geven van uw identiteit of van uw bevoegdheid om voor een ander op te treden.",
          ],
        ),
        note(
          "Een beveiligingsprobleem in onze eigen website gevonden? Dat horen wij graag. Schrijf naar ",
          CONTACT,
          " met wat u hebt gevonden en geef ons een redelijke termijn om het op te lossen voordat u het openbaar maakt.",
        ),
      ],
    },
    {
      id: "scanner",
      title: "De gratis exposure-scanner",
      blocks: [
        p(
          "Met de scanner voert u een websitedomein in en ontvangt u een overzicht van de publiek zichtbare beveiligingsblootstelling ervan. Dit hoofdstuk beschrijft wat de scanner is, wie hem mag gebruiken en wat u van de resultaten mag verwachten.",
        ),
      ],
      subsections: [
        {
          id: "scanner-nature",
          title: "Wat de scanner is, en niet is",
          blocks: [
            p(
              "De scanner is een geautomatiseerde, passieve beoordeling van informatie die iedereen op internet over een domein kan waarnemen: DNS- en e-mailauthenticatierecords, het TLS-certificaat, HTTP-responsheaders, hostnamen in Certificate Transparency-logs, geregistreerde lookalike-domeinen, bekende bestanden en de technologieën die een site bekendmaakt. Hij stuurt geen aanvalsverkeer, logt niet in, test geen bedrijfslogica en probeert niets uit te buiten.",
            ),
            p(
              "De scanner is geen penetratietest, beveiligingsaudit of compliance-beoordeling, en zijn uitkomst is geen certificering van welke aard dan ook. Hij is een eerste, gratis blik op de buitenkant van een domein. Een volledige beoordeling van een webapplicatie of API is waar onze betaalde diensten voor zijn.",
            ),
          ],
        },
        {
          id: "scanner-authorisation",
          title: "Domeinen die u mag scannen",
          blocks: [
            p(
              "U mag alleen domeinen invoeren die van u zijn of die u beheert, of waarvoor u van de eigenaar toestemming heeft om zo'n beoordeling uit te voeren. Door een domein in te voeren bevestigt u dat dit het geval is.",
            ),
            p(
              "De scanner gebruiken om informatie over een organisatie of persoon te verzamelen zonder diens toestemming is niet toegestaan, ook al is de verzamelde informatie publiek waarneembaar. Wij kunnen scans weigeren of verwijderen en de toegang blokkeren wanneer wij misbruik vermoeden.",
            ),
          ],
        },
        {
          id: "scanner-fair-use",
          title: "Beschikbaarheid en redelijk gebruik",
          blocks: [
            p(
              "De scanner wordt kosteloos en naar beschikbaarheid aangeboden. Wij begrenzen het aantal scans per verbinding (momenteel acht per tien minuten), weigeren domeinen die naar privé- of interne adressen verwijzen, en kunnen de dienst op elk moment, tijdelijk of blijvend, zonder aankondiging en zonder aansprakelijkheid vertragen, weigeren of intrekken. Herhaald invoeren van hetzelfde domein binnen korte tijd levert de al lopende scan op in plaats van een nieuwe.",
            ),
          ],
        },
        {
          id: "scanner-results",
          title: "Resultaten",
          blocks: [
            p(
              "Een rapport beschrijft het domein zoals het ons op het moment van de scan voorkwam. Het kan onvolledig zijn: sommige controles kunnen verlopen, geblokkeerd worden of onbeslist blijven, en het rapport vermeldt dat waar dat gebeurde. Elke bevinding heeft een betrouwbaarheidsniveau; bevindingen die als mogelijk zijn gemarkeerd kunnen valse positieven zijn en moeten door een persoon worden geverifieerd voordat iemand ernaar handelt. Een rapport met weinig of geen bevindingen is geen bewijs dat een domein veilig is.",
            ),
            p(
              "De score en de bevindingen zijn informatief. U beslist wat u ermee doet en u bent verantwoordelijk voor het verifiëren van een bevinding voordat u ernaar handelt. Wij informeren de eigenaar van een gescand domein niet, en wij bewaken een domein niet na een scan.",
            ),
          ],
        },
        {
          id: "scanner-links",
          title: "Rapportlinks en delen",
          blocks: [
            p(
              "Een rapport is bereikbaar voor iedereen die de link heeft, zolang het wordt bewaard (momenteel 72 uur, daarna verloopt het). De link is het enige dat het rapport beschermt, dus u bent verantwoordelijk voor met wie u hem deelt. De hostnamen die een rapport noemt komen uit openbare certificaatlogs; details die een aanval zouden verkorten worden vóór opslag verwijderd. Hoe rapporten worden opgeslagen en hoe lang, staat in ons ",
              route("Privacybeleid", "/privacy-policy"),
              ".",
            ),
          ],
        },
        {
          id: "scanner-unlock",
          title: "Een volledig rapport ontgrendelen",
          blocks: [
            p(
              "Om alle bevindingen in een rapport te zien vragen wij uw naam, bedrijf, functie en zakelijke e-mailadres. U moet juiste gegevens verstrekken die van u zelf zijn en een bedrijfsadres gebruiken. Door ze in te dienen gaat u ermee akkoord dat wij na uw scan contact met u kunnen opnemen over onze diensten; u kunt ons op elk moment laten weten dat u dat niet wilt. Hoe wij met deze gegevens omgaan staat in ons ",
              route("Privacybeleid", "/privacy-policy"),
              ".",
            ),
          ],
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectuele eigendom",
      blocks: [
        p(
          "De website, haar ontwerp, teksten, afbeeldingen, artikelen en de opbouw en presentatie van scanrapporten worden beschermd door intellectuele-eigendomsrechten die toebehoren aan AssistSec of haar licentiegevers. De namen en logo's van partners en certificerende instellingen op de site behoren toe aan hun respectieve eigenaren.",
        ),
        p(
          "U mag de inhoud lezen en afdrukken voor eigen gebruik, naar onze pagina's linken en korte passages citeren met bronvermelding en een link naar de bron. Een scanrapport van uw eigen domein mag u binnen uw organisatie gebruiken om de beveiliging ervan te verbeteren. Elke andere verveelvoudiging, verspreiding of commercieel gebruik van onze inhoud vereist onze voorafgaande schriftelijke toestemming.",
        ),
      ],
    },
    {
      id: "third-parties",
      title: "Links en diensten van derden",
      blocks: [
        p(
          "De site verwijst naar diensten die wij niet beheren, waaronder het ARGUS-portaal, LinkedIn en YouTube, en laadt webfonts van Google. Wij zijn niet verantwoordelijk voor de inhoud, beschikbaarheid of werkwijze van diensten van derden. Bij het gebruik ervan gelden hun eigen voorwaarden en privacyverklaringen.",
        ),
      ],
    },
    {
      id: "disclaimer",
      title: "Geen garantie",
      blocks: [
        p(
          'De website en de scanner worden geleverd "zoals ze zijn" en "naar beschikbaarheid". Voor zover de wet dat toelaat geven wij geen enkele garantie, uitdrukkelijk of stilzwijgend, over hun beschikbaarheid, juistheid, volledigheid of geschiktheid voor een bepaald doel. Een beveiligingsbeoordeling kan nooit garanderen dat elke kwetsbaarheid wordt gevonden, en de scanner in het bijzonder kijkt alleen naar de buitenkant van een domein op één moment. Onze verplichting bij het leveren ervan is een inspanningsverplichting, geen resultaatsverplichting.',
        ),
      ],
    },
    {
      id: "liability",
      title: "Aansprakelijkheid",
      blocks: [
        p(
          "Voor zover het Nederlandse recht dat toelaat zijn wij niet aansprakelijk voor schade die voortvloeit uit het gebruik van, of de onmogelijkheid tot gebruik van, de website of de scanner, of uit het vertrouwen op hun inhoud of resultaten. Daaronder valt indirecte en gevolgschade, zoals gederfde winst, verloren gegevens, bedrijfsstagnatie en schade als gevolg van beslissingen die op basis van een rapport zijn genomen.",
        ),
        p(
          "Niets in deze voorwaarden sluit onze aansprakelijkheid uit of beperkt die voor schade veroorzaakt door onze opzet of bewuste roekeloosheid, of enige andere aansprakelijkheid die wettelijk niet kan worden uitgesloten. Waar onze aansprakelijkheid niet kan worden uitgesloten maar wel mag worden beperkt, is zij beperkt tot ",
          gap("liabilityCap"),
          ".",
        ),
      ],
    },
    {
      id: "your-responsibility",
      title: "Uw verantwoordelijkheid",
      blocks: [
        p(
          "U bent verantwoordelijk voor uw gebruik van de website en de scanner, waaronder voor het bevoegd zijn om de domeinen die u invoert te scannen en voor wat u met de resultaten doet. U vergoedt ons de schade en redelijke kosten, inclusief juridische kosten, die voortvloeien uit aanspraken van derden als gevolg van uw schending van deze voorwaarden, in het bijzonder uit het scannen van een domein zonder bevoegdheid.",
        ),
      ],
    },
    {
      id: "suspension",
      title: "Opschorting van toegang",
      blocks: [
        p(
          "Wij kunnen de toegang tot de website of de scanner blokkeren of beperken voor wie deze voorwaarden schendt of wiens gebruik wij redelijkerwijs als schadelijk beschouwen, zonder voorafgaande kennisgeving en zonder aansprakelijkheid. Wij kunnen ook scans en de bijbehorende rapporten verwijderen.",
        ),
      ],
    },
    {
      id: "changes",
      title: "Wijzigingen in deze voorwaarden",
      blocks: [
        p(
          "Wij kunnen deze voorwaarden wijzigen. De datum en het versienummer bovenaan tonen de actuele tekst, en de versie die op het moment van uw gebruik op de site staat is de versie die geldt. Bij een wezenlijke wijziging vestigen wij daar op de site de aandacht op.",
        ),
      ],
    },
    {
      id: "law",
      title: "Toepasselijk recht en geschillen",
      blocks: [
        p(
          "Op deze voorwaarden en op elk geschil dat voortvloeit uit het gebruik van de website of de scanner is Nederlands recht van toepassing. Geschillen worden voorgelegd aan ",
          gap("competentCourt"),
          ", tenzij dwingend recht u het recht geeft het geschil aan een andere rechter voor te leggen. Wij lossen meningsverschillen liever eerst in gesprek op; neem contact met ons op voordat u andere stappen zet.",
        ),
        p(
          "Deze voorwaarden zijn gepubliceerd in het Engels en in het Nederlands. Wijken de twee versies van elkaar af, dan ",
          gap("prevailingLanguage"),
          ". Blijkt een bepaling van deze voorwaarden ongeldig, dan blijven de overige bepalingen van kracht en wordt de ongeldige bepaling vervangen door een geldige die haar strekking het dichtst benadert.",
        ),
      ],
    },
    {
      id: "contact-us",
      title: "Contact",
      blocks: [
        p(
          "Vragen over deze voorwaarden kunt u sturen naar ",
          CONTACT,
          " of naar ons postadres: ",
          gap("address"),
          ".",
        ),
      ],
    },
  ],
};
