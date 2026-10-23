export interface Question {
  q: string;
  options: string[];
  /** Índice de la opción correcta. */
  answer: number;
}

export interface Story {
  id: string;
  title: string;
  emoji: string;
  /** 1 = corto, 2 = medio, 3 = largo. */
  level: 1 | 2 | 3;
  text: string;
  questions: Question[];
}

export const LEVEL_NAMES: Record<Story['level'], string> = {
  1: 'Nivel 1 · Cuentos cortos',
  2: 'Nivel 2 · Cuentos medianos',
  3: 'Nivel 3 · Cuentos largos',
};

export const stories: Story[] = [
  {
    id: 'faro',
    title: 'El faro dormilón',
    emoji: '🗼',
    level: 1,
    text: `En una isla pequeña vivía un faro que siempre tenía sueño. Cada noche bostezaba y su luz se apagaba un poco. Una gaviota llamada Lila se dio cuenta. Los barcos no veían las rocas y tenían que ir muy despacio. Lila tuvo una idea. Todas las noches se posaba en lo alto del faro y le contaba chistes. El faro se reía tanto que su luz brillaba más fuerte que nunca. Desde entonces, los marineros dicen que el faro más alegre del mar es también el más seguro.`,
    questions: [
      { q: '¿Qué problema tenía el faro?', options: ['Siempre tenía sueño', 'Tenía miedo del mar', 'Estaba roto'], answer: 0 },
      { q: '¿Quién ayudó al faro?', options: ['Un marinero', 'Una gaviota llamada Lila', 'Un pez'], answer: 1 },
      { q: '¿Por qué brillaba más la luz al final?', options: ['Porque cambiaron la bombilla', 'Porque llegó el día', 'Porque el faro se reía'], answer: 2 },
    ],
  },
  {
    id: 'bicicleta',
    title: 'La bicicleta azul',
    emoji: '🚲',
    level: 1,
    text: `Mateo recibió una bicicleta azul por su cumpleaños. Quería montar enseguida, pero se caía una y otra vez. Su abuela le dijo que mirara hacia delante y no a sus pies. Mateo respiró hondo, pedaleó y miró el árbol del final de la calle. Esta vez no se cayó. Llegó hasta el árbol y gritó de alegría. Al día siguiente ya podía dar la vuelta a la manzana. Mateo aprendió que equivocarse también es parte de aprender.`,
    questions: [
      { q: '¿De qué color era la bicicleta?', options: ['Roja', 'Azul', 'Verde'], answer: 1 },
      { q: '¿Qué consejo le dio la abuela?', options: ['Que mirara hacia delante', 'Que pedaleara más rápido', 'Que usara ruedas pequeñas'], answer: 0 },
      { q: '¿Qué aprendió Mateo?', options: ['Que las bicicletas son peligrosas', 'Que equivocarse es parte de aprender', 'Que los árboles son altos'], answer: 1 },
    ],
  },
  {
    id: 'semilla',
    title: 'La semilla paciente',
    emoji: '🌱',
    level: 1,
    text: `Sara plantó una semilla en una maceta junto a la ventana. Cada mañana la regaba y le hablaba un poco. Pasó una semana y no salía nada. Sara estaba triste, pero siguió cuidándola. Un día vio una hoja verde muy pequeña asomando por la tierra. Después salieron más hojas, y al final del verano había un girasol enorme que miraba al sol. Sara entendió que las cosas buenas a veces necesitan tiempo.`,
    questions: [
      { q: '¿Dónde puso Sara la maceta?', options: ['En el jardín', 'Junto a la ventana', 'En la cocina'], answer: 1 },
      { q: '¿Qué planta creció al final?', options: ['Un girasol', 'Un tomate', 'Una rosa'], answer: 0 },
      { q: '¿Qué palabra describe mejor a Sara?', options: ['Impaciente', 'Perezosa', 'Constante'], answer: 2 },
    ],
  },
  {
    id: 'robot',
    title: 'El robot que no sabía bailar',
    emoji: '🤖',
    level: 2,
    text: `En el taller del señor Ramírez había un robot llamado Tuerca. Tuerca sabía barrer, ordenar herramientas y hasta preparar zumo de naranja. Pero había algo que no sabía hacer: bailar. Cada vez que sonaba música, sus brazos se movían hacia un lado y sus piernas hacia el otro. Los otros aparatos del taller se reían de él.
Una tarde, la nieta del señor Ramírez, Elena, encontró a Tuerca escondido detrás de un armario. Le preguntó qué le pasaba y el robot le contó su problema. Elena sonrió y le dijo que bailar no consistía en hacerlo perfecto, sino en disfrutar. Puso su canción favorita y empezó a moverse de forma muy divertida. Tuerca la imitó. Al principio se sentía torpe, pero poco a poco empezó a reír con sus luces de colores. Aquella noche hubo una fiesta en el taller, y el que más bailó fue Tuerca.`,
    questions: [
      { q: '¿Cómo se llamaba el robot?', options: ['Tornillo', 'Tuerca', 'Ramírez'], answer: 1 },
      { q: '¿Qué cosas sabía hacer el robot?', options: ['Barrer y preparar zumo', 'Cantar y pintar', 'Volar y nadar'], answer: 0 },
      { q: '¿Qué le enseñó Elena?', options: ['Que hay que practicar mucho', 'Que bailar es disfrutar, no hacerlo perfecto', 'Que los robots no bailan'], answer: 1 },
      { q: '¿Cómo se sentía Tuerca al principio de bailar con Elena?', options: ['Torpe', 'Enfadado', 'Aburrido'], answer: 0 },
    ],
  },
  {
    id: 'mapa',
    title: 'El mapa del desván',
    emoji: '🗺️',
    level: 2,
    text: `Un día de lluvia, Lucía y su hermano Pablo subieron al desván de la casa de sus abuelos. Entre cajas viejas encontraron un mapa dibujado a mano. Tenía una cruz roja junto a un árbol con forma de letra ese. Los hermanos se miraron con los ojos muy abiertos: ¡era un mapa del tesoro!
Cuando dejó de llover, salieron al jardín con una pala. Buscaron el árbol torcido y lo encontraron al fondo, cerca de la valla. Cavaron durante un buen rato hasta que la pala chocó con algo duro. Era una caja de metal oxidada. Dentro no había oro ni joyas, sino cartas, fotos antiguas y una canica de cristal. La abuela les explicó que era su caja de recuerdos de cuando era niña. Lucía y Pablo decidieron hacer su propia caja del tesoro para que, algún día, otros niños la encontraran.`,
    questions: [
      { q: '¿Dónde encontraron el mapa?', options: ['En el jardín', 'En el desván', 'En la escuela'], answer: 1 },
      { q: '¿Qué forma tenía el árbol del mapa?', options: ['De letra ese', 'De corazón', 'De estrella'], answer: 0 },
      { q: '¿Qué había dentro de la caja?', options: ['Monedas de oro', 'Juguetes nuevos', 'Cartas, fotos y una canica'], answer: 2 },
      { q: '¿Qué decidieron hacer los hermanos al final?', options: ['Vender la caja', 'Hacer su propia caja del tesoro', 'Buscar otro mapa'], answer: 1 },
    ],
  },
  {
    id: 'pulpo',
    title: 'Ocho brazos para ayudar',
    emoji: '🐙',
    level: 2,
    text: `En el fondo del mar vivía Olivia, una pulpo muy curiosa. Tenía ocho brazos y siempre estaba ocupada. Con uno ordenaba conchas, con otro saludaba a los peces y con otro escribía mensajes en la arena. Pero a veces se sentía sola, porque todos pensaban que estaba demasiado ocupada para jugar.
Una mañana, una tortuga pequeña quedó atrapada en una red de pescar. Los peces nadaban de un lado a otro sin saber qué hacer. Olivia llegó rápidamente y usó sus ocho brazos a la vez: unos sujetaban la red, otros deshacían los nudos y otros acariciaban a la tortuga para tranquilizarla. En poco tiempo la tortuga quedó libre.
Desde aquel día, los animales del arrecife invitaron a Olivia a todos sus juegos. Descubrieron que tener tantos brazos no solo servía para trabajar, sino también para dar los mejores abrazos del océano.`,
    questions: [
      { q: '¿Por qué se sentía sola Olivia?', options: ['Porque vivía lejos', 'Porque pensaban que estaba muy ocupada', 'Porque no sabía nadar'], answer: 1 },
      { q: '¿Qué le pasó a la tortuga?', options: ['Se perdió', 'Quedó atrapada en una red', 'Se hizo daño en una aleta'], answer: 1 },
      { q: '¿Para qué más servían los ocho brazos, según el final?', options: ['Para dar abrazos', 'Para nadar rápido', 'Para esconderse'], answer: 0 },
    ],
  },
  {
    id: 'cometa',
    title: 'La cometa de papel',
    emoji: '🪁',
    level: 2,
    text: `Hugo quería participar en el concurso de cometas del pueblo, pero no tenía dinero para comprar una. Su vecina, la señora Carmen, le dio periódicos viejos, cañas y un ovillo de hilo. Hugo pasó toda la tarde construyendo su cometa. Pegó el papel con cuidado, ató las cañas en forma de cruz y le hizo una cola larga con trozos de tela de colores.
El día del concurso, las otras cometas eran grandes y brillantes. Algunos niños se rieron de la cometa de periódico. Hugo sintió vergüenza, pero cuando sopló el viento corrió con todas sus fuerzas. La cometa subió, se balanceó y siguió subiendo hasta ser la más alta del cielo. El jurado le dio el premio a la cometa más original. Hugo corrió a casa de la señora Carmen para enseñarle la medalla y darle las gracias.`,
    questions: [
      { q: '¿Por qué Hugo no compró una cometa?', options: ['No le gustaban', 'No tenía dinero', 'La tienda estaba cerrada'], answer: 1 },
      { q: '¿Con qué hizo la cola de la cometa?', options: ['Con trozos de tela', 'Con plumas', 'Con hojas de árbol'], answer: 0 },
      { q: '¿Qué premio ganó Hugo?', options: ['A la cometa más grande', 'A la cometa más rápida', 'A la cometa más original'], answer: 2 },
      { q: '¿Qué hizo Hugo después de ganar?', options: ['Se fue a dormir', 'Fue a dar las gracias a la señora Carmen', 'Rompió la cometa'], answer: 1 },
    ],
  },
  {
    id: 'biblioteca',
    title: 'La biblioteca secreta',
    emoji: '📚',
    level: 3,
    text: `Valeria era la niña más callada de su clase. En el recreo prefería sentarse en un rincón a leer en lugar de jugar al fútbol. Un martes, mientras buscaba un libro en la biblioteca del colegio, empujó sin querer una estantería y esta giró como una puerta. Detrás había una habitación pequeña, iluminada por una ventana redonda, llena de libros que nunca había visto.
Sobre una mesa había una nota escrita con letra elegante: «Esta biblioteca pertenece a quien más ame las historias. Cuídala y compártela». Valeria pasó allí todos los recreos de aquella semana. Leyó sobre volcanes, piratas, planetas lejanos y animales que brillan en la oscuridad.
Sin embargo, pronto se dio cuenta de que la nota decía también «compártela». Al principio le daba miedo, porque no sabía si los demás se reirían de ella. Al final, se armó de valor e invitó a su compañero Diego, que siempre se aburría en clase de lectura. Diego eligió un libro de dinosaurios y no lo soltó hasta que sonó el timbre.
Poco a poco, más niños se unieron. Valeria les recomendaba libros según lo que les gustaba, y descubrió que hablar de historias la hacía sentir valiente. La biblioteca secreta dejó de ser un secreto, pero se convirtió en el lugar favorito de todo el colegio.`,
    questions: [
      { q: '¿Cómo descubrió Valeria la habitación?', options: ['Encontró una llave', 'Empujó una estantería que giró', 'Se lo contó la maestra'], answer: 1 },
      { q: '¿Qué pedía la nota de la mesa?', options: ['Que nadie entrara', 'Que la cuidara y la compartiera', 'Que devolviera los libros'], answer: 1 },
      { q: '¿Por qué le daba miedo compartir la biblioteca?', options: ['Temía que se rieran de ella', 'Temía que rompieran los libros', 'Temía castigos'], answer: 0 },
      { q: '¿Qué libro eligió Diego?', options: ['Uno de piratas', 'Uno de planetas', 'Uno de dinosaurios'], answer: 2 },
    ],
  },
  {
    id: 'volcan',
    title: 'Expedición al volcán',
    emoji: '🌋',
    level: 3,
    text: `La clase de ciencias de la maestra Inés iba a hacer una excursión muy especial: visitar un volcán dormido. Durante el viaje en autobús, Tomás no paraba de hacer preguntas. ¿Podía despertarse el volcán? ¿Qué había dentro? ¿Por qué la tierra alrededor era tan negra?
Al llegar, un guía llamado Andrés les explicó que la tierra oscura era lava que se había enfriado hacía miles de años. Les enseñó piedras muy ligeras, llenas de agujeros, que podían flotar en el agua. Los niños no se lo podían creer hasta que lo comprobaron en un cubo.
Después subieron por un sendero hasta el borde del cráter. Desde arriba se veía todo el valle, con sus campos verdes y sus pueblos blancos. Andrés les contó que la ceniza del volcán hace que la tierra sea muy buena para cultivar, y por eso la gente sigue viviendo cerca a pesar del peligro. Los científicos vigilan el volcán todos los días con aparatos especiales que notan los pequeños temblores.
En el viaje de vuelta, Tomás estuvo muy callado. La maestra le preguntó si estaba cansado. Él respondió que no, que estaba pensando. Había decidido que, de mayor, quería ser vulcanólogo para cuidar de los pueblos que viven junto a los volcanes.`,
    questions: [
      { q: '¿Por qué la tierra alrededor del volcán era negra?', options: ['Por la lluvia', 'Era lava enfriada', 'Estaba pintada'], answer: 1 },
      { q: '¿Qué tenían de especial algunas piedras?', options: ['Brillaban de noche', 'Eran muy calientes', 'Podían flotar en el agua'], answer: 2 },
      { q: '¿Por qué la gente vive cerca del volcán?', options: ['Porque la tierra es buena para cultivar', 'Porque hace calor', 'Porque no hay otro sitio'], answer: 0 },
      { q: '¿Qué quiere ser Tomás de mayor?', options: ['Maestro', 'Guía', 'Vulcanólogo'], answer: 2 },
    ],
  },
  {
    id: 'carrera',
    title: 'La carrera de relevos',
    emoji: '🏃',
    level: 3,
    text: `Faltaba una semana para la carrera de relevos entre colegios, y el equipo de cuarto tenía un problema. Martina, la corredora más rápida, se había torcido el tobillo jugando en el parque. El entrenador reunió a todos y preguntó quién quería ocupar su lugar. Nadie levantó la mano, hasta que Samuel, que era el más lento de la clase, dijo tímidamente que él lo intentaría.
Algunos compañeros pusieron cara de preocupación. Samuel lo notó, pero no se rindió. Cada tarde, después de los deberes, practicaba en el patio con Martina, que lo animaba desde un banco con el pie vendado. Ella le enseñó a entregar el testigo sin mirar atrás y a salir corriendo justo en el momento adecuado.
El día de la carrera, el equipo iba en tercer lugar cuando le tocó a Samuel. Recibió el testigo perfectamente, sin perder ni un segundo, y corrió como nunca. No adelantó a nadie, pero tampoco se quedó atrás. Su entrega a la última corredora fue tan limpia que ella pudo adelantar a los otros dos equipos en la recta final.
Ganaron la carrera. Cuando les dieron la copa, todos querían felicitar a la última corredora, pero ella señaló a Samuel y a Martina. Explicó que la victoria era de todo el equipo, y especialmente de quienes habían trabajado en silencio para que todo saliera bien.`,
    questions: [
      { q: '¿Por qué Martina no podía correr?', options: ['Estaba enferma', 'Se había torcido el tobillo', 'Estaba de viaje'], answer: 1 },
      { q: '¿Qué le enseñó Martina a Samuel?', options: ['A correr más rápido que nadie', 'A entregar el testigo sin mirar atrás', 'A saltar obstáculos'], answer: 1 },
      { q: '¿En qué puesto iba el equipo cuando le tocó a Samuel?', options: ['Primero', 'Segundo', 'Tercero'], answer: 2 },
      { q: '¿Cuál es la idea principal del cuento?', options: ['Solo gana el más rápido', 'El esfuerzo de todo el equipo cuenta', 'Las carreras son aburridas'], answer: 1 },
    ],
  },
];
