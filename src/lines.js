// ============================================================
//  Commentary lines (English + Hindi).  Add or edit freely - one line is picked at random.
//  If a matching mp3 exists (see AUDIO_MAP in audio.js) it is played instead of speech.
// ============================================================
export const LINES = {
  en: {
    four: ['FOUR! Cracking shot!', 'Races away to the boundary!', 'What timing - that is four!'],
    six: ['SIX! Out of the park!', 'That has gone miles - a massive six!', 'Into the crowd! Maximum!'],
    wicket: ['OUT! What a delivery!', 'Gone! The bowler strikes!', 'That is a big wicket!'],
    lbw: ['Huge appeal for LBW!', 'Howzat! Plumb in front?'],
    review: ['Review taken! Let us see what the third umpire says.', 'The captain goes upstairs!'],
    out: ['That is OUT!'],
    notout: ['NOT OUT! The decision is overturned.', 'Saved by the review!'],
    simp: ['Ouch! Simp Gulley is down - out for a duck!'],
    dot: ['Dot ball.', 'Nothing on that one.'],
    defend: ['Solid defence.', 'Well left alone, well defended.'],
    beaten: ['Beaten! The bat missed it.', 'Right past the edge!'],
    single: ['Single taken.', 'Pushed for one.'],
    two: ['Two runs, good running.', 'They come back for the second!'],
    three: ['Three runs! Excellent running between the wickets.'],
    fifty: ['Fifty up! A fine knock.'],
    hundred: ['A magnificent hundred!'],
    win: ['What a match! Congratulations on the win!'],
    lose: ['Hard luck, better next time.'],
  },
  hi: {
    four: ['चौका! क्या शानदार शॉट!', 'गेंद सीधी सीमा रेखा के पार!', 'वाह! क्या टाइमिंग है, चार रन!'],
    six: ['छक्का! गेंद स्टेडियम के बाहर!', 'ये तो आसमान में गई, ज़बरदस्त छक्का!', 'सीधा दर्शकों में! पूरे छह रन!'],
    wicket: ['आउट! क्या गेंद थी!', 'गया! गेंदबाज़ ने विकेट ले लिया!', 'ये तो बहुत बड़ा विकेट है!'],
    lbw: ['एलबीडब्ल्यू की ज़ोरदार अपील!', 'हाउज़ैट! क्या सीधा पैड पर लगी?'],
    review: ['रिव्यू लिया गया! देखते हैं थर्ड अंपायर क्या कहते हैं।', 'कप्तान ने रिव्यू माँगा!'],
    out: ['आउट! उँगली उठ गई।'],
    notout: ['नॉट आउट! फ़ैसला बदल गया।', 'रिव्यू ने बचा लिया!'],
    simp: ['आउच! सिंप गुल्ली ढेर, खाता भी नहीं खुला!'],
    dot: ['डॉट बॉल।', 'इस गेंद पर कोई रन नहीं।'],
    defend: ['बढ़िया डिफ़ेंस।', 'सधा हुआ बचाव।'],
    beaten: ['बल्ले के पास से निकल गई! चूक गए।', 'बाल-बाल बचे!'],
    single: ['एक रन लिया।', 'धकेलकर एक रन।'],
    two: ['दो रन, बढ़िया दौड़!', 'दूसरे रन के लिए वापस दौड़े!'],
    three: ['तीन रन! विकेटों के बीच शानदार दौड़!'],
    fifty: ['पचास रन पूरे! शानदार पारी।'],
    hundred: ['शतक! क्या बेहतरीन पारी!'],
    win: ['क्या मैच था! जीत की बधाई हो!'],
    lose: ['किस्मत ने साथ नहीं दिया, अगली बार बेहतर।'],
  },
};
export const ZONE_HI = { 0: 'सीधा', 1: 'कवर', 2: 'पॉइंट', 3: 'थर्ड मैन', 4: 'पीछे', '-1': 'मिड-विकेट', '-2': 'स्क्वायर लेग', '-3': 'फ़ाइन लेग' };
export function pickLine(lang, key) {
  const arr = (LINES[lang] && LINES[lang][key]) || (LINES.en[key]) || [''];
  return arr[Math.floor(Math.random() * arr.length)];
}
