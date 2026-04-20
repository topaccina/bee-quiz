import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const jsonPath = path.join(__dirname, '..', 'public', 'questions.json')

/* Argomenti consolidati in questions.json: vedi merge-topics.mjs */
const newTopics = []

/** @param {number} id */
function q(id, text, options, correctIndex, topicKey, explanation, time = 25) {
  return {
    id: `q${id}`,
    text,
    options,
    correctIndex,
    topicKey,
    explanation,
    timeLimitSeconds: time
  }
}

const newQuestions = [
  // Etologia (12)
  q(
    41,
    "Nel linguaggio delle foraggere, cosa comunica soprattutto la durata del tratto rettilineo ('corrida') nella danza a otto?",
    [
      'Solo la ricchezza di polline',
      'La distanza approssimativa della fonte di cibo',
      "L'età della regina",
      'Il colore del fiore'
    ],
    1,
    'bees',
    'La durata del tratto rettilineo è correlata alla distanza della risorsa; l’angolo rispetto alla verticale indica la direzione.'
  ),
  q(
    42,
    'Le operaie riconoscono le compagne della stessa colonia principalmente grazie a:',
    [
      'Solo alla lunghezza delle ali',
      'Profilo cuticolare e feromoni',
      'Il rumore del volo',
      'La temperatura corporea'
    ],
    1,
    'bees',
    'Le api discriminano le conspecifiche tramite miscela di idrocarburi cuticolari e altri segnali chimici.'
  ),
  q(
    43,
    "Cos'è la trofallassi tra operaie?",
    [
      'Deposizione di uova',
      'Combattimento tra casta',
      'Scambio di liquidi alimentari e informazioni',
      'Costruzione di cera'
    ],
    2,
    'bees',
    'La trofallassi è la trasmissione bocca a bocca di cibo e può coinvolgere anche segnali ormonali.'
  ),
  q(
    44,
    'Per polietismo temporale si intende che le operaie:',
    [
      'Cambiano colore con la stagione',
      'Passano progressivamente a compiti diversi con l’età',
      'Vivono solo in primavera',
      'Non foraggiano mai'
    ],
    1,
    'bees',
    'Dalla pulizia del nido al foraggio, le mansioni tipiche seguono un andamento legato all’età dell’ape.'
  ),
  q(
    45,
    'Le operaie addette alla pulizia del nido e alla rimozione dei cadaveri sono spesso chiamate:',
    ['Foraggere', 'Nutrici', 'Spazzine / portinerie', 'Cerifere'],
    2,
    'bees',
    'Le spazzine trasportano fuori corpi morti e detriti per mantenere l’igiene del nido.'
  ),
  q(
    46,
    'La danza rotonda comunica in genere:',
    [
      'Una fonte molto lontana',
      'Una fonte vicina all’alveare',
      'Un pericolo imminente',
      'La fine della stagione'
    ],
    1,
    'bees',
    'Per risorse prossime all’alveare le api usano spesso la danza rotonda; per distanze maggiori prevale la danza a otto.'
  ),
  q(
    47,
    'Quale funzione hanno in gran parte le feromoni mandibolari della regina?',
    [
      'Attrarre solo i fuchi',
      'Coesione del ammasso e inibizione parziale di cellule reali',
      'Produrre cera',
      'Cristallizzare il miele'
    ],
    1,
    'bees',
    'I feromoni regali contribuiscono all’armonia sociale e a regolare aspetti della riproduzione nel nido.'
  ),
  q(
    48,
    'Le api ventilano il nido battendo le ali per:',
    ['Deporre uova', 'Ridurre CO₂ e regolare temperatura/umidità', 'Costruire cera', 'Accoppiarsi'],
    1,
    'bees',
    'La ventilazione è fondamentale per scambi gassosi e termoregolazione, soprattutto con covata densa.'
  ),
  q(
    49,
    'Un volo di orientamento delle giovani operaie serve soprattutto a:',
    [
      'Deporre polline',
      'Imparare la posizione dell’alveare rispetto al paesaggio',
      'Eliminare la regina',
      'Produrre propoli'
    ],
    1,
    'bees',
    'Prima del foraggio effettivo le operaie effettuano voli di orientamento per memorizzare riferimenti visivi e odori.'
  ),
  q(
    50,
    'Il suono definito “piping” emesso dalla regina è associato spesso a:',
    [
      'Solo nutrizione larve',
      'Fasi di emergenza o preparazione allo sciame',
      'Cristallizzazione del miele',
      'Assenza totale di covata'
    ],
    1,
    'bees',
    'Il piping è un segnale acustico legato a dinamiche di regina e colonia, inclusi aspetti legati allo sciame.'
  ),
  q(
    51,
    'Le antenne dell’ape sono importanti soprattutto per:',
    [
      'Solo equilibrio in volo',
      'Percezione chimica e tattile dell’ambiente',
      'Emissione di cera',
      'Digestione del polline'
    ],
    1,
    'bees',
    'Ricettori olfattivi e tattili sulle antenne guidano foraggio, riconoscimento sociale e valutazione dei fiori.'
  ),
  q(
    52,
    'Un’ape foraggera che trova una buona fonte e torna al nido può reclutare compagne tramite:',
    ['Solo odor di propoli', 'Danze e contatto antennale', 'Solo fuco', 'Deposito di cera'],
    1,
    'bees',
    'Oltre alla danza, contatti e condivisione di campioni odorosi aiutano a reclutare altre foraggere.'
  ),

  // Sciamatura (12)
  q(
    53,
    'In termini biologici, la sciamatura rappresenta soprattutto:',
    [
      'Perdita accidentale di api',
      'Riproduzione della colonia a livello di superorganismo',
      'Solo raccolta di polline',
      'Malattia della covata'
    ],
    1,
    'bees',
    'Lo sciame è il modo con cui una colonia si moltiplica: una parte delle api lascia con una regina verso una nuova sede.'
  ),
  q(
    54,
    'Dopo lo sciame principale, nella colonia madre restano tipicamente:',
    [
      'Solo fuchi',
      'Operaie e celle reali con nuove regime in sviluppo',
      'Sempre la vecchia regina',
      'Nessuna covata'
    ],
    1,
    'bees',
    'Nello sciame primario parte la vecchia regina con una frazione delle operaie; nel nido restano celle reali e nuove regime.'
  ),
  q(
    55,
    'Le celle reali pendenti lungo il margine del favo sono destinate a:',
    [
      'Deporre uova di fuco',
      'Sviluppare nuove regime',
      'Conservare miele',
      'Raccogliere polline'
    ],
    1,
    'bees',
    'Le celle reali contengono larve femminili nutrite abbondantemente per diventare regime vergini.'
  ),
  q(
    56,
    'In clima temperato, la sciamatura naturale è più frequente in genere:',
    ['In pieno inverno', 'Tarda primavera / inizio estate', 'Solo in autunno secco', 'Durante la neve'],
    1,
    'bees',
    'Con forte covata e risorse disponibili, la propensione allo sciame aumenta verso la bella stagione.'
  ),
  q(
    57,
    'Una colonia molto popolosa e senza spazio sufficiente di covata tende a:',
    [
      'Estinguersi in giorni',
      'Aumentare il rischio di sciamatura',
      'Produrre solo cera senza covata',
      'Perdere tutte le ali'
    ],
    1,
    'bees',
    'Congestione e regina in buone condizioni favoriscono preparativi per lo sciame.'
  ),
  q(
    58,
    'Per ridurre sciami indesiderati l’apicoltore può, tra le altre cose:',
    [
      'Chiudere per mesi il volo',
      'Dare spazio (melari/telai), dividere o gestire celle reali',
      'Eliminare tutta la covata',
      'Togliere tutte le operaie anziane'
    ],
    1,
    'bees',
    'Spazio, giovane regina e gestione delle celle reali sono leve classiche di prevenzione.'
  ),
  q(
    59,
    'Il volo nuziale della regina vergine serve a:',
    [
      'Deporre subito uova fecondate senza accoppiamento',
      'Accoppiarsi con più fuchi in volo',
      'Solo ventilare il nido',
      'Migrare in altro continente'
    ],
    1,
    'bees',
    'La regina si accoppia tipicamente con più fuchi durante uno o più voli nuziali.'
  ),
  q(
    60,
    'Una sciamatura secondaria può verificarsi quando:',
    [
      'Non esiste mai',
      'Una nuova regina vergine esce con un nuovo sciame',
      'Solo in laboratorio',
      'Solo senza miele'
    ],
    1,
    'bees',
    'Dopo lo sciame primario, altre regime possono portare sciami secondari se la colonia resta molto forte.'
  ),
  q(
    61,
    'Il feromone Nasonov secreto dalle operaie serve soprattutto a:',
    [
      'Uccidere la varroa',
      'Segnare orientamento verso sedi (es. ingresso alveare o sciame)',
      'Cristallizzare il miele',
      'Fermare la covata'
    ],
    1,
    'bees',
    'Le operaie sollevano l’addome e diffondono Nasonov per guidare compagne verso una posizione.'
  ),
  q(
    62,
    'Catturare uno sciame appollaiato su un ramo si fa di solito:',
    [
      'Spruzzando benzina',
      'Scuotendo o tagliando il ramo in un contenitore e trasferendo in arnia',
      'Lasciandolo sempre al sole fino a morte',
      'Solo di notte senza mai aprire'
    ],
    1,
    'bees',
    'Si usa un cestello/scatola sciame e si travasa con calma in arnia predisposta con telai.'
  ),
  q(
    63,
    'Uno “sciame artificiale” può essere creato per:',
    [
      'Aumentare le punture',
      'Moltiplicare colonie o rinfoltire nuclei',
      'Eliminare la propoli',
      'Sostituire l’acqua piovana'
    ],
    1,
    'bees',
    'La divisione controllata di telai con covata e api replica in parte il processo naturale.'
  ),
  q(
    64,
    'Subito dopo l’ingresso di uno sciame in arnia nuova è buona norma:',
    [
      'Chiudere tutto per tre mesi',
      'Controllare costruzione su telai/fondazione e nutrire se risorse scarse',
      'Rimuovere la regina',
      'Aggiungere solo fuchi'
    ],
    1,
    'bees',
    'Le riserve e la costruzione di favo vanno monitorate per evitare fame e ripartenza dello sciame.'
  ),

  // Salute (12)
  q(
    65,
    'Varroa destructor è un:',
    ['Virus intestinale', 'Acaro ectoparassita', 'Fungo del favo', 'Insetto predatore delle api'],
    1,
    'hive_management',
    'La varroa si attacca alle api e alla covata, veicola virus e indebolisce la colonia.'
  ),
  q(
    66,
    'Ali deformi nelle operaie emergenti sono spesso correlate a:',
    [
      'Solo freddo notturno',
      'Virus (es. DWV) in associazione a carica elevata di varroa',
      'Troppo miele chiaro',
      'Solo mancanza di polline'
    ],
    1,
    'hive_management',
    'DWV e altri virus si moltiplicano nel ciclo varroa–ape e si manifestano con sintomi alare.'
  ),
  q(
    67,
    'Nosema apis / ceranae è:',
    ['Un acaro', 'Un microsporidio che colpisce l’intestino', 'Un batterio della covata', 'Un nematode'],
    1,
    'hive_management',
    'I Nosema sono patogeni unicellulari che possono ridurre la longevità e l’efficienza delle operaie.'
  ),
  q(
    68,
    'La loque americana (American foulbrood) è causata da:',
    ['Varroa destructor', 'Paenibacillus larvae', 'Ascosphaera apis', 'Virus israeliano acuto'],
    1,
    'hive_management',
    'AFB è una malattia batterica della covata con spore molto resistenti.'
  ),
  q(
    69,
    'La calcificazione (chalkbrood) è dovuta a:',
    ['Batterio', 'Fungo Ascosphaera su larve', 'Acaro', 'Virus DWV'],
    1,
    'hive_management',
    'Le larve infette si momificano in masse gessose bianche o grigiastre.'
  ),
  q(
    70,
    'Il monitoraggio integrato della varroa include spesso:',
    [
      'Solo osservazione esterna',
      'Conta alare (tappeto o lavaggio) e scelta di trattamenti mirati',
      'Mai trattare',
      'Solo fumo'
    ],
    1,
    'hive_management',
    'Misurare l’infestazione guida tempi e metodi (meccanici, biologici, chimici) secondo normativa.'
  ),
  q(
    71,
    'Le spore di loque americana possono:',
    [
      'Morire in poche ore all’aria',
      'Restare vitali anni in cera e attrezzature contaminate',
      'Essere eliminate solo con vento',
      'Essere ignorate sempre'
    ],
    1,
    'hive_management',
    'Per questo AFB richiede protocolli rigorosi di bonifica o distruzione del materiale.'
  ),
  q(
    72,
    'L’acaro delle trachee (Acarapis woodi) vive:',
    ['Nel miele', 'Nel sistema tracheale delle api', 'Solo sulle ali', 'Nel terreno'],
    1,
    'hive_management',
    'È un parassita interno meno comune di Varroa ma storicamente noto in apicoltura.'
  ),
  q(
    73,
    'La “sparizione” massiccia di operaie (sindrome tipo CCD) è considerata in genere:',
    [
      'Dovuta a un solo virus identificato',
      'Multifattoriale (patogeni, nutrizione, pesticidi, gestione…)',
      'Normale ogni primavera',
      'Curabile solo con zucchero invertito'
    ],
    1,
    'hive_management',
    'La letteratura scientifica descrive interazioni complesse più che una singola causa.'
  ),
  q(
    74,
    'La melata prodotta dagli afidi può favorire:',
    [
      'Crescita più lenta delle piante',
      'Sviluppo di muffe fuligginose sulle foglie',
      'Eliminazione della varroa',
      'Cristallizzazione istantanea del miele'
    ],
    1,
    'hive_management',
    'I funghi fuligginosi crescono sulle melate escrete su foglie e frutti.'
  ),
  q(
    75,
    'Gli acidi organici contro varroa (es. formico, ossalico) vanno usati:',
    [
      'In qualsiasi momento senza leggere etichetta',
      'Seguendo scheda tecnica, dosi e limitazioni (covata, temperatura, residui)',
      'Solo con colonie deboli',
      'Solo a dicembre al polo sud'
    ],
    1,
    'hive_management',
    'Sicurezza per api, operatore e qualità dei prodotti dell’alveare dipende dal rispetto delle norme.'
  ),
  q(
    76,
    'Un apiario con segni sospetti di loque americana deve essere gestito:',
    [
      'Come sempre, senza segnalazioni',
      'Con isolamento, campionamento e rispetto delle norme sanitarie locali',
      'Vendendo subito il miele',
      'Ignorando i telai scuri'
    ],
    1,
    'hive_management',
    'Molte regioni prevedono notifica e protocolli ufficiali per patologie di notifica.'
  ),

  // Strumenti (12)
  q(
    77,
    "L'affumicatore serve principalmente a:",
    [
      'Nutrire le api',
      'Calmare le api mascherando feromoni di allarme e inducendo carica di miele',
      'Sterilizzare i telai',
      'Misurare la temperatura'
    ],
    1,
    'hive_management',
    'Il fumo moderato riduce la probabilità di punture durante la manipolazione.'
  ),
  q(
    78,
    'Nel fumigatore è opportuno bruciare materiali che:',
    [
      'Producano fiamma alta continua',
      'Brucino lentamente senza tossicità per api e apicoltore',
      'Siano sempre impregnati di benzina',
      'Siano solo plastica'
    ],
    1,
    'hive_management',
    'Si usano paglia, cartone, trucioli specifici; evitare sostanze nocive o fumi troppo caldi.'
  ),
  q(
    79,
    'Il levatelaio serve a:',
    ['Tagliare la regina', 'Sollevare telai incollati da propoli o cera', 'Misurare il peso', 'Ventilare'],
    1,
    'hive_management',
    'Aiuta a non danneggiare i favi quando i telai aderiscono ai margini.'
  ),
  q(
    80,
    'La spatola uncinata è utile per:',
    [
      'Solo mungere',
      'Sganciare telai e raschiare depositi di propoli/cera',
      'Contare le api',
      'Accendere il fumo'
    ],
    1,
    'hive_management',
    'È uno degli attrezzi più usati in apertura melario e pulizia bordi.'
  ),
  q(
    81,
    'Il velo o maschera apistica protegge soprattutto:',
    ['Solo le mani', 'Viso e collo', 'Solo i piedi', 'Solo i telai'],
    1,
    'hive_management',
    'Le punture a occhi e labbra sono particolarmente pericolose; il velo riduce il rischio.'
  ),
  q(
    82,
    'Un escludi-regina nel melario serve a:',
    [
      'Far entrare solo i fuchi',
      'Impedire alla regina di salire a deporre uova nel melario',
      'Riscaldare il melario',
      'Bloccare il volo di tutte le api'
    ],
    1,
    'hive_management',
    'Si ottiene miele senza covata (né uova/larve) nei telai da estrazione.'
  ),
  q(
    83,
    'La bilancia sotto arnia è utile per:',
    [
      'Contare le singole api',
      'Monitorare peso e andamento di scorte/raccolta',
      'Misurare solo la regina',
      'Decorazione'
    ],
    1,
    'hive_management',
    'Curve di peso aiutano a decidere su nutrizione, raccolto e vigilanza sanitaria.'
  ),
  q(
    84,
    'Il tappeto alare per diagnosi di varroa si basa su:',
    [
      'Contare le ali cadute',
      'Raccogliere e analizzare caduta naturale o campione (protocolli noti)',
      'Solo annusare l’alveare',
      'Misurare il colore della cera'
    ],
    1,
    'hive_management',
    'Si combina con lavaggi o altre tecniche per stimare carica parassitaria.'
  ),
  q(
    85,
    'Il carrello o slitta per arnie serve a:',
    ['Aumentare le punture', 'Spostare rinchiostrate con meno sforzo', 'Uccidere varroa', 'Solo estetica'],
    1,
    'hive_management',
    'Utile in apiari con molte colonie o terreni impervi.'
  ),
  q(
    86,
    'Registri di apiario (trattamenti, movimenti, produzione) sono importanti per:',
    [
      'Solo decoro',
      'Tracciabilità, normativa e buona gestione',
      'Nessun motivo',
      'Solo vendere cera'
    ],
    1,
    'hive_management',
    'In molti contesti sono richiesti o fortemente consigliati per sicurezza alimentare e sanità.'
  ),
  q(
    87,
    'Telaini in acciaio inox rispetto al legno sono spesso:',
    [
      'Sempre vietati',
      'Più lavabili e duraturi in certi contesti igienici',
      'Più leggeri del polistirolo',
      'Impermeabili al miele'
    ],
    1,
    'hive_management',
    'Si usano in laboratori o dove serve sanificazione frequente; hanno pro e contro rispetto al legno.'
  ),
  q(
    88,
    'Un fumo eccessivo o troppo caldo può:',
    [
      'Essere indifferente',
      'Stressare o bruciare le api',
      'Eliminare la varroa da solo',
      'Sostituire la regina'
    ],
    1,
    'hive_management',
    'Il fumo va dosato: poche puff mirate sono meglio di fumo denso e prolungato.'
  ),

  // Veleno / specialità (12)
  q(
    89,
    'Il veleno d’ape contiene soprattutto:',
    ['Solo zucchero', 'Peptidi come melittina, apamina e enzimi (es. fosfolipasi)', 'Solo cera', 'Nettare concentrato'],
    1,
    'bee_products',
    'È una complessa miscela bioattiva prodotta dalle ghiandole acido e alcalino.'
  ),
  q(
    90,
    'Una reazione anafilattica a puntura di ape:',
    [
      'È sempre normale',
      'È un’emergenza medica potenzialmente letale in soggetti sensibilizzati',
      'Si cura solo con miele',
      'Succede solo ai fuchi'
    ],
    1,
    'bee_products',
    'Chi ha allergie note deve avere piano terapeutico; l’apicoltore deve conoscere i rischi.'
  ),
  q(
    91,
    'La propoli per le api è soprattutto:',
    [
      'Un tipo di miele scuro',
      'Resine vegetali raccolte e mescolate a secrezioni e cera',
      'Polline pressato',
      'Acqua di fiori'
    ],
    1,
    'bee_products',
    'Viene usata per sigillare, incollare e sanificare superfici nel nido.'
  ),
  q(
    92,
    'La pappa reale è prodotta da:',
    ['La regina', 'Ghiandole delle operaie (ipofaringee e mandibolari)', 'I fuchi', 'I fiori'],
    1,
    'bee_products',
    'È secreta dalle operaie e somministrata in dosi diverse a larve di casta diversa.'
  ),
  q(
    93,
    'Il veleno d’ape per uso terapeutico o di laboratorio richiede:',
    ['Solo raccolta manuale con pinze', 'Dispositivi e procedure specializzate e normative', 'Nessuna cautela', 'Solo miele diluito'],
    1,
    'bee_products',
    'La raccolta e commercializzazione seguono regole stringenti per sicurezza e qualità.'
  ),
  q(
    94,
    'Dopo una puntura, la prima cosa utile è spesso:',
    [
      'Premere forte il veleno dentro',
      'Rimuovere rapidamente il pungiglione per ridurre l’iniezione',
      'Applicare miele caldo obbligatoriamente',
      'Ignorare sempre la reazione'
    ],
    1,
    'bee_products',
    'Il pungiglione può continuare a iniettare; raschiarlo via riduce il carico di veleno.'
  ),
  q(
    95,
    'Il miele “tossico” da alcune piante (es. rododendro) può contenere:',
    ['Solo vitamina C', 'Grayanotossine e altri composti vegetali', 'Solo acqua', 'Solo fruttosio'],
    1,
    'bee_products',
    'Non va confuso con il veleno d’ape; è un rischio legato a botanica e origine geografica del nettare.'
  ),
  q(
    96,
    'Il polline d’api come alimento umano è apprezzato per:',
    [
      'Solo grassi saturi',
      'Proteine, vitamine, minerali e fitocomposti',
      'Assenza totale di zuccheri',
      'Solo alcool'
    ],
    1,
    'bee_products',
    'È considerato un superfood; attenzione a qualità e allergie.'
  ),
  q(
    97,
    'L’apitossicazione massiccia (molte punture) può essere pericolosa perché:',
    [
      'Non inietta veleno',
      'Somma dose di tossine e mediatori dell’infiammazione',
      'Succede solo d’inverno',
      'È solo estetica'
    ],
    1,
    'bee_products',
    'Anche in non allergici, molte punture possono dare shock tossico.'
  ),
  q(
    98,
    'Le controindicazioni all’apiterapia con veleno includono tipicamente:',
    [
      'Nessuna: tutti possono',
      'Allergie, gravidanza, alcune patologie cardiovascolari/immunitarie',
      'Solo età > 100 anni',
      'Solo api nere'
    ],
    1,
    'bee_products',
    'Va sempre valutata da personale sanitario qualificato dove previsto.'
  ),
  q(
    99,
    'La melittina nel veleno d’ape è nota per:',
    [
      'Dolcificare il miele',
      'Proprietà lisante sulle membrane cellulari',
      'Produrre cera',
      'Eliminare la covata'
    ],
    1,
    'bee_products',
    'È uno dei principali peptidi citotossici del veleno.'
  ),
  q(
    100,
    'In cosmetica il veleno d’ape compare talvolta in:',
    [
      'Concentrazioni pure al 50% per tutti',
      'Formulazioni professionali a bassa dose, non prodotti non controllati',
      'Solo dentifrici al fluoro',
      'Solo benzina'
    ],
    1,
    'bee_products',
    'L’etichettatura e la sicurezza variano per Paese; diffidare dei prodotti non tracciati.'
  )
]

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

const existingKeys = new Set(data.topics.map((t) => t.key))
for (const t of newTopics) {
  if (!existingKeys.has(t.key)) {
    data.topics.push(t)
    existingKeys.add(t.key)
  }
}

const existingIds = new Set(data.questions.map((q) => q.id))
for (const nq of newQuestions) {
  if (!existingIds.has(nq.id)) {
    data.questions.push(nq)
    existingIds.add(nq.id)
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8')
console.log('topics:', data.topics.length, 'questions:', data.questions.length)
