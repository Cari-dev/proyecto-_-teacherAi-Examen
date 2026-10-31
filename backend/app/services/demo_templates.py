from app.schemas.assistant import AssistantRequest

DEMO_HEADER = (
    "MODO DEMOSTRACIÓN · PLANTILLA LOCAL\n"
    "Esta respuesta fue creada con una plantilla de TeacherAI y NO fue generada por Gemini.\n"
    "Configura GEMINI_API_KEY en backend/.env para utilizar el modelo real."
)


def generate_demo_content(payload: AssistantRequest) -> str:
    """Genera material educativo de ejemplo sin afirmar que proviene de una IA."""
    context = (
        f"Asignatura: {payload.subject}\n"
        f"Nivel educativo: {payload.education_level}\n"
        f"Tema: {payload.topic}"
    )

    builders = {
        "ideas": _ideas,
        "activities": _activities,
        "questions": _questions,
        "explanation": _explanation,
        "adaptation": _adaptation,
    }
    body = builders[payload.content_type](payload)
    extra = ""
    if payload.additional_instructions:
        extra = f"\n\n## Indicaciones adicionales consideradas\n{payload.additional_instructions}"

    return f"{DEMO_HEADER}\n\n{context}\n\n{body}{extra}"


def _ideas(payload: AssistantRequest) -> str:
    return f"""## Idea general de la clase
Presentar "{payload.topic}" a partir de una situación cercana al estudiante, avanzar hacia la conceptualización y cerrar con una aplicación breve. La propuesta está pensada para {payload.education_level}.

## Secuencia sugerida (90 minutos)
1. **Inicio · 15 min:** plantear una pregunta retadora sobre "{payload.topic}" y recoger saberes previos.
2. **Exploración · 25 min:** trabajo en parejas con un ejemplo, texto o problema breve relacionado con {payload.subject}.
3. **Conceptualización · 25 min:** explicación guiada y organización de ideas en un esquema.
4. **Aplicación · 15 min:** resolver una situación nueva y comparar estrategias.
5. **Cierre · 10 min:** ticket de salida con una idea aprendida y una duda pendiente.

## Estrategias didácticas
- Aprendizaje activo con preguntas guía.
- Trabajo colaborativo en parejas o tríos.
- Uso de ejemplos cotidianos y representaciones visuales.
- Retroalimentación inmediata mediante preguntas de verificación.

## Evidencias de aprendizaje
- Esquema o ficha con los conceptos principales.
- Respuesta al ticket de salida.
- Explicación oral breve de una aplicación del tema.

## Sugerencia de evaluación formativa
Observar la participación, revisar el ticket de salida y anotar dos fortalezas y una oportunidad de mejora por equipo."""


def _activities(payload: AssistantRequest) -> str:
    return f"""## Actividad 1 · Exploración guiada
**Objetivo:** activar saberes previos sobre "{payload.topic}".
**Desarrollo:** formar parejas, entregar una ficha con dos preguntas y pedir que registren acuerdos. Socializar tres respuestas.
**Materiales:** ficha impresa o cuaderno, pizarra.
**Duración:** 15 minutos.

## Actividad 2 · Construcción colaborativa
**Objetivo:** aplicar el contenido de {payload.subject} mediante un producto del equipo.
**Desarrollo:** en tríos, elaborar un esquema, mini-maqueta o solución a una situación problema. Cada equipo explica una decisión tomada.
**Materiales:** papelotes, marcadores, material concreto reciclable.
**Duración:** 35 minutos.

## Actividad 3 · Reto de transferencia
**Objetivo:** comprobar si el aprendizaje se aplica en un contexto nuevo.
**Desarrollo:** plantear un caso con datos distintos y resolverlo de forma individual. Luego comparar respuestas con la técnica "pienso, comparto, presento".
**Materiales:** hoja de trabajo.
**Duración:** 25 minutos.

## Criterios de observación
- Participa y justifica sus ideas.
- Relaciona el tema con ejemplos del entorno.
- Escucha y complementa el trabajo del equipo.
- Explica con claridad el procedimiento o producto final."""


def _questions(payload: AssistantRequest) -> str:
    return f"""## Cuestionario sugerido sobre "{payload.topic}"
**Indicación:** marca una sola alternativa correcta.

**Pregunta 1.** ¿Cuál de las siguientes afirmaciones describe mejor el tema central?
A. Una idea secundaria del tema.
B. La idea principal trabajada en clase.
C. Un ejemplo sin relación con el tema.
D. Una opinión personal.
**Respuesta sugerida:** B.

**Pregunta 2.** ¿Qué ejemplo permite aplicar correctamente lo aprendido en {payload.subject}?
A. Un caso que contradice el concepto.
B. Un dato sin contexto.
C. Una situación cotidiana que utiliza el concepto.
D. Una definición incompleta.
**Respuesta sugerida:** C.

**Pregunta 3.** ¿Qué paso ayuda a comprobar una respuesta antes de entregarla?
A. Copiar la primera opción.
B. Revisar la consigna y justificar con evidencia.
C. Omitir los datos del problema.
D. Cambiar la respuesta sin revisar.
**Respuesta sugerida:** B.

**Pregunta 4.** ¿Cuál es la mejor forma de explicar la idea principal a un compañero?
A. Repetir una palabra aislada.
B. Leer la respuesta sin explicar.
C. Usar un ejemplo y relacionarlo con el concepto.
D. Evitar ejemplos.
**Respuesta sugerida:** C.

**Pregunta 5.** ¿Qué evidencia demuestra una comprensión profunda del tema?
A. Memorizar una frase sin explicarla.
B. Aplicar el concepto a una situación nueva y justificar.
C. Elegir una opción al azar.
D. Copiar una definición sin contexto.
**Respuesta sugerida:** B.

## Recomendación docente
Ajusta los distractores al vocabulario del nivel {payload.education_level} y valida que cada opción incorrecta represente un error frecuente."""


def _explanation(payload: AssistantRequest) -> str:
    return f"""## Explicación educativa: {payload.topic}
"{payload.topic}" se comprende mejor cuando se conecta con una experiencia concreta y luego se representa de forma abstracta. Para el nivel {payload.education_level}, conviene avanzar en tres pasos: observar, explicar y aplicar.

## Ideas clave
- **Definición:** presentar el concepto con una frase breve y un ejemplo.
- **Elementos:** identificar las partes o variables que intervienen.
- **Relación:** mostrar cómo se conectan entre sí dentro de {payload.subject}.
- **Aplicación:** resolver una situación nueva usando el concepto.

## Analogía para el aula
Imagina que el concepto es una herramienta: primero observamos cómo se usa, después practicamos con acompañamiento y finalmente la utilizamos de manera autónoma en un reto.

## Ejemplo guiado
1. Presentar la situación y los datos relevantes.
2. Preguntar qué información falta o qué idea podría ayudar.
3. Modelar un primer paso en la pizarra.
4. Pedir al estudiante que complete el siguiente paso y explique por qué.
5. Comparar la respuesta con los criterios de la clase.

## Errores frecuentes y cómo abordarlos
- Confundir un ejemplo con la definición: volver a la idea clave y pedir una nueva ejemplificación.
- Memorizar sin comprender: solicitar una explicación con palabras propias.
- Aplicar sin revisar la consigna: usar una lista de verificación breve.

## Cierre
Pedir a cada estudiante que complete: "Aprendí que ... y puedo usarlo cuando ...". Compartir dos respuestas y ofrecer retroalimentación específica."""


def _adaptation(payload: AssistantRequest) -> str:
    return f"""## Adaptación del contenido: {payload.topic}
La siguiente propuesta permite ajustar el mismo aprendizaje a distintas necesidades dentro de {payload.education_level}, manteniendo el objetivo central y variando apoyos y desafíos.

## 1. Simplificación del lenguaje
- Reemplazar términos técnicos por definiciones breves.
- Acompañar cada explicación con una imagen o ejemplo concreto.
- Dividir la consigna en pasos numerados.

## 2. Apoyos para estudiantes que lo requieren
- Ofrecer una plantilla con el inicio de la respuesta.
- Permitir responder oralmente, con esquemas o con apoyo visual.
- Trabajar en parejas con roles definidos.
- Dar tiempo adicional y revisar el avance en momentos intermedios.

## 3. Enriquecimiento para quienes avanzan más rápido
- Proponer un caso con datos adicionales o una restricción nueva.
- Pedir que expliquen su estrategia a otro compañero.
- Solicitar una segunda solución y una comparación entre ambas.

## 4. Accesibilidad y participación
- Usar letra grande, buen contraste y espacio suficiente en las fichas.
- Leer las consignas en voz alta y verificar comprensión.
- Ofrecer opciones para demostrar el aprendizaje: explicar, escribir, dibujar o representar.

## 5. Evaluación inclusiva
Valorar el progreso respecto al punto de partida con una rúbrica simple de tres criterios: comprensión del concepto, uso de evidencia y claridad de la explicación. Registrar una fortaleza y un siguiente paso para cada estudiante."""
