/**
 * Utilidad integral de traducción y adaptación al español argentino para incidencias
 * y minuto a minuto de partidos del fútbol argentino y sudamericano.
 */

export interface TranslatedEvent {
  title: string;
  detail: string;
  type: 'goal' | 'penalty_goal' | 'yellow_card' | 'red_card' | 'sub' | 'corner' | 'foul' | 'offside' | 'general' | 'var';
  icon: string;
  colorClass: string;
}

export function translateEventText(rawText: string, defaultType?: string): TranslatedEvent {
  if (!rawText) {
    return {
      title: 'Incidencia del partido',
      detail: '',
      type: 'general',
      icon: '⏱️',
      colorClass: 'text-[#8B949E]',
    };
  }

  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Helper de traducción general de fragmentos comunes en inglés de ESPN
  const applyCommonReplacements = (str: string): string => {
    return str
      .replace(/is shown the yellow card for a bad foul/gi, 'es amonestado con tarjeta amarilla por juego brusco')
      .replace(/is shown the yellow card for/gi, 'es amonestado con tarjeta amarilla por')
      .replace(/is shown the yellow card/gi, 'es amonestado con tarjeta amarilla')
      .replace(/is shown the red card for/gi, 'es expulsado con tarjeta roja por')
      .replace(/is shown the red card/gi, 'es expulsado con tarjeta roja')
      .replace(/from very close range/gi, 'desde muy cerca a quemarropa')
      .replace(/very close range/gi, 'corta distancia')
      .replace(/following a corner/gi, 'tras un tiro de esquina')
      .replace(/because of an injury/gi, 'por atención médica a')
      .replace(/due to an injury/gi, 'debido a una lesión')
      .replace(/after a foul in the penalty area/gi, 'tras una falta cometida en el área')
      .replace(/after a foul/gi, 'tras una infracción')
      .replace(/in the penalty area/gi, 'dentro del área penal')
      .replace(/inside the penalty box/gi, 'dentro del área')
      .replace(/inside the box/gi, 'dentro del área')
      .replace(/from outside the box/gi, 'desde afuera del área')
      .replace(/outside the box/gi, 'desde afuera del área')
      .replace(/from the centre of the box/gi, 'en el corazón del área')
      .replace(/from the center of the box/gi, 'en el corazón del área')
      .replace(/from the/gi, 'desde el')
      .replace(/centre of the box/gi, 'corazón del área')
      .replace(/center of the box/gi, 'corazón del área')
      .replace(/difficult angle/gi, 'ángulo cerrado')
      .replace(/six yard box/gi, 'área chica')
      .replace(/fast break/gi, 'contragolpe')
      .replace(/assisted by/gi, 'Asistencia de')
      .replace(/with a cross/gi, 'tras un centro')
      .replace(/with a through ball/gi, 'con pase filtrado')
      .replace(/with a headed pass/gi, 'con asistencia de cabeza')
      .replace(/conceded by/gi, 'concedido por')
      .replace(/drawn by/gi, 'provocada por')
      .replace(/draws a foul in the penalty area/gi, 'recibe falta dentro del área penal')
      .replace(/draws a foul/gi, 'recibe una infracción')
      .replace(/wins a free kick/gi, 'consigue un tiro libre')
      .replace(/in the defensive half/gi, 'en su propio campo')
      .replace(/in the attacking half/gi, 'en campo rival')
      .replace(/on the right wing/gi, 'por la banda derecha')
      .replace(/on the left wing/gi, 'por la banda izquierda')
      .replace(/to the bottom right corner/gi, 'al palo derecho abajo')
      .replace(/to the bottom left corner/gi, 'al palo izquierdo abajo')
      .replace(/to the top right corner/gi, 'al ángulo superior derecho')
      .replace(/to the top left corner/gi, 'al ángulo superior izquierdo')
      .replace(/to the top centre of the goal/gi, 'al medio por arriba')
      .replace(/to the centre of the goal/gi, 'al medio del arco')
      .replace(/to the center of the goal/gi, 'al medio del arco')
      .replace(/bottom right corner/gi, 'palo derecho abajo')
      .replace(/bottom left corner/gi, 'palo izquierdo abajo')
      .replace(/top right corner/gi, 'ángulo superior derecho')
      .replace(/top left corner/gi, 'ángulo superior izquierdo')
      .replace(/high and wide to the right/gi, 'muy desviado por arriba a la derecha')
      .replace(/high and wide to the left/gi, 'muy desviado por arriba a la izquierda')
      .replace(/misses to the right/gi, 'se va desviado a la derecha')
      .replace(/misses to the left/gi, 'se va desviado a la izquierda')
      .replace(/is close, but misses/gi, 'pasa rozando el poste')
      .replace(/hits the left post/gi, 'se estrella en el poste izquierdo')
      .replace(/hits the right post/gi, 'se estrella en el poste derecho')
      .replace(/hits the bar/gi, 'se estrella en el travesaño')
      .replace(/hits the crossbar/gi, 'se estrella en el travesaño')
      .replace(/is blocked/gi, 'es interceptado por la defensa')
      .replace(/is saved in the/gi, 'es atajado en el')
      .replace(/is saved/gi, 'es atajado por el arquero')
      .replace(/saved in the/gi, 'atajado en el')
      .replace(/replaces/gi, 'ingresa por')
      .replace(/for violent conduct/gi, 'por conducta violenta')
      .replace(/for a bad foul/gi, 'por juego brusco')
      .replace(/for handball/gi, 'por mano intencional')
      .replace(/for dissent/gi, 'por protestar al árbitro')
      .replace(/for time wasting/gi, 'por demorar la reanudación')
      .replace(/for unsporting behavior/gi, 'por conducta antideportiva')
      .replace(/for excessive celebration/gi, 'por festejo desmedido')
      .replace(/to the/gi, 'hacia el');
  };

  // 1. GOL / GOAL (Solo si realmente es un gol válido y no un intento o atajada)
  const isNegative =
    lower.includes('missed') ||
    lower.includes('saved') ||
    lower.includes('attempt') ||
    lower.includes('disallowed') ||
    lower.includes('cancelled') ||
    lower.includes('penalty missed');

  const isGoalStrict =
    !isNegative &&
    (lower.startsWith('goal!') || lower.startsWith('gol!') || lower.startsWith('¡gol!') ||
     lower.includes('goal!') || lower.includes('¡gol!') ||
     lower.includes('own goal by') || lower.includes('gol en contra'));

  if ((isGoalStrict || (!isNegative && (defaultType === 'goal' || defaultType === 'penalty_goal')))) {
    const isPenalty = lower.includes('penalty') || lower.includes('penal') || defaultType === 'penalty_goal';
    const isOwnGoal = lower.includes('own goal') || lower.includes('en contra');

    let clean = text
      .replace(/Goal!/gi, '¡GOL!')
      .replace(/^Goal:/gi, '¡GOL!:')
      .replace(/Own Goal by/gi, 'Gol en contra de')
      .replace(/header from the centre of the box/gi, 'cabezazo en el corazón del área')
      .replace(/header from the center of the box/gi, 'cabezazo en el corazón del área')
      .replace(/right footed shot/gi, 'remate con pierna derecha')
      .replace(/left footed shot/gi, 'remate con pierna izquierda');

    clean = applyCommonReplacements(clean);

    return {
      title: isPenalty ? '⚽ ¡GOL DE PENAL!' : isOwnGoal ? '⚽ ¡GOL EN CONTRA!' : '⚽ ¡GOL!',
      detail: clean,
      type: isPenalty ? 'penalty_goal' : 'goal',
      icon: '⚽',
      colorClass: 'text-[#10B981]',
    };
  }

  // 2. PENALES (Concedido, cometido o fallado)
  if (lower.includes('penalty') || lower.includes('penal')) {
    let clean = text
      .replace(/Penalty conceded by/gi, 'Penal sancionado para el rival tras infracción de')
      .replace(/Penalty saved/gi, '¡Penal atajado por el arquero!')
      .replace(/Penalty missed/gi, '¡Penal fallado!')
      .replace(/Penalty/gi, 'Penal');

    clean = applyCommonReplacements(clean);

    return {
      title: '🎯 Penal',
      detail: clean,
      type: 'penalty_goal',
      icon: '🎯',
      colorClass: 'text-[#E63946]',
    };
  }

  // 3. TARJETA ROJA / EXPULSIÓN
  if (lower.includes('red card') || lower.includes('tarjeta roja') || lower.includes('expuls') || defaultType === 'red_card') {
    let clean = text
      .replace(/Red card to/gi, 'Tarjeta roja para')
      .replace(/Second yellow card to/gi, 'Segunda tarjeta amarilla y expulsión para')
      .replace(/Red card/gi, 'Tarjeta roja');

    clean = applyCommonReplacements(clean);

    return {
      title: '🟥 Tarjeta Roja',
      detail: clean,
      type: 'red_card',
      icon: '🟥',
      colorClass: 'text-[#E63946]',
    };
  }

  // 4. TARJETA AMARILLA / AMONESTACIÓN
  if (lower.includes('yellow card') || lower.includes('tarjeta amarilla') || lower.includes('amonest') || defaultType === 'yellow_card') {
    let clean = text
      .replace(/Yellow card to/gi, 'Tarjeta amarilla para')
      .replace(/Yellow card/gi, 'Tarjeta amarilla');

    clean = applyCommonReplacements(clean);

    return {
      title: '🟨 Tarjeta Amarilla',
      detail: clean,
      type: 'yellow_card',
      icon: '🟨',
      colorClass: 'text-[#F5A623]',
    };
  }

  // 5. CAMBIOS / SUSTITUCIONES
  if (lower.includes('substitution') || lower.includes('sustitución') || lower.includes('cambio') || defaultType === 'sub') {
    let clean = text
      .replace(/Substitution,/gi, 'Cambio en')
      .replace(/Substitution/gi, 'Cambio');

    clean = applyCommonReplacements(clean);

    return {
      title: '🔄 Cambio',
      detail: clean,
      type: 'sub',
      icon: '🔄',
      colorClass: 'text-[#0093EC]',
    };
  }

  // 6. CÓRNER / TIRO DE ESQUINA
  if (lower.includes('corner') || lower.includes('córner') || lower.includes('tiro de esquina')) {
    let clean = text
      .replace(/Corner,/gi, 'Tiro de esquina para')
      .replace(/Corner/gi, 'Tiro de esquina');

    clean = applyCommonReplacements(clean);

    return {
      title: '🚩 Tiro de Esquina',
      detail: clean,
      type: 'corner',
      icon: '🚩',
      colorClass: 'text-[#DCA842]',
    };
  }

  // 7. VAR / REVISIÓN DE JUGADA
  if (lower.includes('var') || lower.includes('video assistant referee')) {
    let clean = text
      .replace(/VAR Decision:/gi, 'Decisión del VAR:')
      .replace(/Card upgraded/gi, 'Tarjeta cambiada a roja')
      .replace(/Goal awarded/gi, 'Gol convalidado tras revisión')
      .replace(/Goal cancelled/gi, 'Gol anulado tras revisión')
      .replace(/Penalty awarded/gi, 'Penal confirmado tras revisión')
      .replace(/No penalty/gi, 'Sin penal');

    clean = applyCommonReplacements(clean);

    return {
      title: '🖥️ Revisión VAR',
      detail: clean,
      type: 'var',
      icon: '🖥️',
      colorClass: 'text-[#9D4EDD]',
    };
  }

  // 8. TIROS / REMATES / ATAJADAS
  if (lower.includes('attempt') || lower.includes('shot') || lower.includes('remate') || lower.includes('tiro')) {
    let clean = text
      .replace(/Attempt missed\./gi, 'Remate desviado.')
      .replace(/Attempt blocked\./gi, 'Remate bloqueado por la defensa.')
      .replace(/Attempt saved\./gi, '¡Remate atajado por el arquero!')
      .replace(/right footed shot/gi, 'remate con pierna derecha')
      .replace(/left footed shot/gi, 'remate con pierna izquierda');

    clean = applyCommonReplacements(clean);

    return {
      title: '⚡ Remate al Arco',
      detail: clean,
      type: 'general',
      icon: '⚡',
      colorClass: 'text-[#F1EDE6]',
    };
  }

  // 9. FUERA DE JUEGO / OFFSIDE
  if (lower.includes('offside') || lower.includes('fuera de juego') || lower.includes('adelantado')) {
    let clean = text
      .replace(/Offside,/gi, 'Posición adelantada,')
      .replace(/is caught offside/gi, 'estaba en posición fuera de juego');

    clean = applyCommonReplacements(clean);

    return {
      title: '⚠️ Fuera de Juego',
      detail: clean,
      type: 'offside',
      icon: '⚠️',
      colorClass: 'text-[#8B949E]',
    };
  }

  // 10. FALTAS E INFRACCIONES
  if (lower.includes('foul') || lower.includes('falta')) {
    let clean = text
      .replace(/Foul by/gi, 'Infracción cometida por')
      .replace(/Foul/gi, 'Falta');

    clean = applyCommonReplacements(clean);

    return {
      title: '🛑 Falta',
      detail: clean,
      type: 'foul',
      icon: '🛑',
      colorClass: 'text-[#8B949E]',
    };
  }

  // 11. DEMORAS Y PARATES / ATENCIÓN MÉDICA
  if (lower.includes('delay') || lower.includes('injury') || defaultType === 'delay') {
    let clean = text
      .replace(/Delay in match because of an injury/gi, 'Detención del juego por atención médica a')
      .replace(/Delay in match due to an injury/gi, 'Detención del juego por lesión de')
      .replace(/Delay in match/gi, 'Detención momentánea del juego')
      .replace(/because of an injury/gi, 'por atención médica a')
      .replace(/due to an injury/gi, 'por lesión de')
      .replace(/Delay over\. They are ready to continue\./gi, 'Juego reanudado por el árbitro.');

    clean = applyCommonReplacements(clean);

    return {
      title: '🩹 Atención Médica',
      detail: clean,
      type: 'general',
      icon: '🩹',
      colorClass: 'text-[#8B949E]',
    };
  }

  // 12. ETAPAS DEL PARTIDO (Inicio, entretiempo, final)
  if (lower.includes('first half begins') || lower.includes('kick off') || lower === 'kickoff' || lower.includes('kickoff')) {
    return {
      title: '▶️ Pitazo Inicial',
      detail: 'Comienza el primer tiempo reglamentario.',
      type: 'general',
      icon: '▶️',
      colorClass: 'text-[#10B981]',
    };
  }
  if (lower.includes('first half ends') || lower.includes('halftime')) {
    let clean = text
      .replace(/First Half ends,/gi, 'Final del primer tiempo.')
      .replace(/First Half ends/gi, 'Final del primer tiempo.')
      .replace(/Halftime/gi, 'Final del primer tiempo.');
    clean = applyCommonReplacements(clean);
    return {
      title: '⏸️ Entretiempo',
      detail: clean || 'Finaliza el primer tiempo reglamentario.',
      type: 'general',
      icon: '⏸️',
      colorClass: 'text-[#DCA842]',
    };
  }
  if (lower.includes('second half begins') || lower.includes('start 2nd half') || lower.includes('start second half')) {
    let clean = text
      .replace(/Second Half begins/gi, 'Comienza el segundo tiempo.')
      .replace(/Start 2nd Half/gi, 'Comienza el segundo tiempo.');
    clean = applyCommonReplacements(clean);
    return {
      title: '▶️ Segundo Tiempo',
      detail: clean || 'Comienza el segundo tiempo reglamentario.',
      type: 'general',
      icon: '▶️',
      colorClass: 'text-[#10B981]',
    };
  }
  if (lower.includes('match ends') || lower.includes('full time') || lower.includes('end regular time')) {
    let clean = text
      .replace(/Match ends,/gi, 'Final del partido.')
      .replace(/Match ends/gi, 'Final del partido.')
      .replace(/End Regular Time/gi, 'Finalizan los 90 minutos reglamentarios.');
    clean = applyCommonReplacements(clean);
    return {
      title: '🏁 Final del Encuentro',
      detail: clean || 'Finalizan los 90 minutos reglamentarios.',
      type: 'general',
      icon: '🏁',
      colorClass: 'text-[#DCA842]',
    };
  }

  // Fallback con traducción general de frases en inglés
  return {
    title: 'Incidencia Oficial',
    detail: applyCommonReplacements(text),
    type: 'general',
    icon: '⏱️',
    colorClass: 'text-[#8B949E]',
  };
}
