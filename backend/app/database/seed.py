from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Activity, Assessment, Plan, Question, QuestionOption


def _count(db: Session, model: type) -> int:
    return db.scalar(select(func.count()).select_from(model)) or 0


def seed_demo_data(db: Session) -> None:
    """Carga ejemplos identificados como Demostración solo si falta cada tipo."""
    if _count(db, Plan) == 0:
        db.add_all(
            [
                Plan(
                    title="Fracciones equivalentes (Demostración)",
                    subject="Matemática",
                    education_level="Primaria",
                    course="5.º grado",
                    topic="Fracciones equivalentes",
                    learning_objective=(
                        "Reconocer y representar fracciones equivalentes mediante material concreto "
                        "y situaciones cotidianas."
                    ),
                    duration_minutes=90,
                    content=(
                        "1. Exploración de fracciones con tiras de papel.\n"
                        "2. Comparación de fracciones equivalentes usando representaciones gráficas.\n"
                        "3. Aplicación en problemas de reparto y medición.\n"
                        "4. Socialización de estrategias y conclusiones."
                    ),
                    activities=(
                        "Inicio: lluvia de ideas sobre repartos justos.\n"
                        "Desarrollo: construcción de fracciones con tiras y parejas de equivalencias.\n"
                        "Cierre: ticket de salida con una fracción equivalente a 1/2."
                    ),
                    resources="Tiras de papel, regla, marcadores, cuaderno, pizarra, proyector.",
                    is_demo=True,
                ),
                Plan(
                    title="El ciclo del agua en nuestro entorno (Demostración)",
                    subject="Ciencia y Tecnología",
                    education_level="Secundaria",
                    course="1.º de secundaria",
                    topic="Ciclo del agua",
                    learning_objective=(
                        "Explicar las etapas del ciclo del agua y su relación con el clima local "
                        "utilizando un modelo simple."
                    ),
                    duration_minutes=90,
                    content=(
                        "1. Saberes previos sobre evaporación y lluvia.\n"
                        "2. Etapas del ciclo del agua y sus procesos físicos.\n"
                        "3. Construcción de un modelo con materiales reciclados.\n"
                        "4. Reflexión sobre el cuidado del agua en la comunidad."
                    ),
                    activities=(
                        "Inicio: pregunta retadora sobre el origen del agua de lluvia.\n"
                        "Desarrollo: lectura guiada y maqueta del ciclo del agua en equipos.\n"
                        "Cierre: exposición breve y compromiso de ahorro de agua."
                    ),
                    resources="Botellas recicladas, agua, colorante, plastilina, ficha de lectura, proyector.",
                    is_demo=True,
                ),
            ]
        )

    if _count(db, Activity) == 0:
        db.add_all(
            [
                Activity(
                    title="Bingo de fracciones (Demostración)",
                    subject="Matemática",
                    education_level="Primaria",
                    topic="Fracciones equivalentes",
                    description=(
                        "Los estudiantes completan un cartón de bingo identificando fracciones "
                        "equivalentes. Gana quien reconozca primero cinco equivalencias correctas."
                    ),
                    activity_type="Juego educativo",
                    estimated_duration_minutes=30,
                    is_demo=True,
                ),
                Activity(
                    title="Debate: ¿cómo cuidamos el agua? (Demostración)",
                    subject="Ciencia y Tecnología",
                    education_level="Secundaria",
                    topic="Ciclo del agua",
                    description=(
                        "Debate guiado por roles sobre el uso responsable del agua. Cada equipo "
                        "presenta evidencias y propone una acción concreta para el centro educativo."
                    ),
                    activity_type="Debate",
                    estimated_duration_minutes=45,
                    is_demo=True,
                ),
            ]
        )

    if _count(db, Assessment) == 0:
        assessment = Assessment(
            title="Evaluación diagnóstica: fracciones (Demostración)",
            subject="Matemática",
            education_level="Primaria",
            instructions="Lee cada pregunta y marca una sola respuesta correcta. Tiempo estimado: 20 minutos.",
            is_demo=True,
            questions=[
                Question(
                    text="¿Cuál de estas fracciones es equivalente a 1/2?",
                    order_index=0,
                    options=[
                        QuestionOption(text="2/4", is_correct=True, order_index=0),
                        QuestionOption(text="1/3", is_correct=False, order_index=1),
                        QuestionOption(text="2/3", is_correct=False, order_index=2),
                        QuestionOption(text="3/5", is_correct=False, order_index=3),
                    ],
                ),
                Question(
                    text="Si divides una pizza en 8 partes iguales y comes 4, ¿qué fracción comiste?",
                    order_index=1,
                    options=[
                        QuestionOption(text="1/8", is_correct=False, order_index=0),
                        QuestionOption(text="1/2", is_correct=True, order_index=1),
                        QuestionOption(text="3/4", is_correct=False, order_index=2),
                        QuestionOption(text="4/6", is_correct=False, order_index=3),
                    ],
                ),
                Question(
                    text="¿Qué fracción representa la mitad de un entero?",
                    order_index=2,
                    options=[
                        QuestionOption(text="1/4", is_correct=False, order_index=0),
                        QuestionOption(text="2/3", is_correct=False, order_index=1),
                        QuestionOption(text="1/2", is_correct=True, order_index=2),
                    ],
                ),
            ],
        )
        db.add(assessment)

    db.commit()
