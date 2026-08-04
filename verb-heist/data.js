(function(root){
const raw=[
 ['take','took','taken','Last night, someone ___ the office key.','The suspect has ___ the key.','The thief taked the documents and ran away.','taked','took','The documents have been took from the archive.','took','taken'],
 ['write','wrote','written','Yesterday, she ___ a coded letter.','She has already ___ three warnings.','The witness writed a message in blue ink.','writed','wrote','The note was wrote in a hurry.','wrote','written'],
 ['break','broke','broken','The intruder ___ the window last night.','Someone has ___ the cabinet lock.','The thief breaked the glass door.','breaked','broke','The seal had been broke before midnight.','broke','broken'],
 ['steal','stole','stolen','A stranger ___ the archive map.','Someone has ___ the secret file.','The suspect stealed a gold key.','stealed','stole','The evidence was stole from the desk.','stole','stolen'],
 ['see','saw','seen','The guard ___ a shadow upstairs.','I have never ___ that symbol before.','She seed a man near the vault.','seed','saw','The suspect was last saw at midnight.','saw','seen'],
 ['go','went','gone','The librarian ___ home early.','The only witness has ___ missing.','He goed into the locked room.','goed','went','The messenger had went before dawn.','went','gone'],
 ['find','found','found','We ___ a clue under the carpet.','The detective has ___ the missing page.','They finded a key in the drawer.','finded','found','The lost file was finally finded.','finded','found'],
 ['leave','left','left','The suspect ___ through the back door.','Someone has ___ a note on the desk.','She leaved the lamp on all night.','leaved','left','The package had been leaved outside.','leaved','left'],
 ['hide','hid','hidden','The thief ___ behind the curtains.','They have ___ the key in a book.','He hided the evidence downstairs.','hided','hid','The letter was hid inside the clock.','hid','hidden'],
 ['choose','chose','chosen','The chief ___ his best detective.','They have ___ a new code word.','She choosed the safest route.','choosed','chose','The wrong key had been chose.','chose','chosen'],
 ['give','gave','given','The witness ___ us one clue.','He has ___ a false address.','She gived the guard a sealed note.','gived','gave','No reason was gave for the delay.','gave','given'],
 ['know','knew','known','The inspector ___ the answer immediately.','We have ___ the truth for weeks.','Nobody knowed about the tunnel.','knowed','knew','His real name was not knew then.','knew','known'],
 ['drive','drove','driven','The suspect ___ away in a black car.','She has ___ this route before.','He drived through the gates at ten.','drived','drove','The car had been drove all night.','drove','driven'],
 ['speak','spoke','spoken','The witness ___ very quietly.','I have already ___ to the guard.','She speaked to nobody that night.','speaked','spoke','The final words were spoke in secret.','spoke','spoken'],
 ['wear','wore','worn','The intruder ___ a dark coat.','He has always ___ black gloves.','The stranger weared a silver ring.','weared','wore','This badge had never been wore.','wore','worn'],
 ['send','sent','sent','The agent ___ a message at dawn.','They have ___ the report already.','He sended the code by telegram.','sended','sent','The warning was sended too late.','sended','sent'],
 ['bring','brought','brought','The courier ___ a locked case.','She has ___ new evidence.','He bringed the file after lunch.','bringed','brought','The documents were bringed upstairs.','bringed','brought'],
 ['catch','caught','caught','The detective ___ the thief outside.','They have finally ___ the spy.','The guard catched him at the gate.','catched','caught','The criminal was catched at midnight.','catched','caught'],
 ['make','made','made','The suspect ___ one serious mistake.','Someone has ___ a copy of the key.','She maked a map of the building.','maked','made','The decision was maked in secret.','maked','made'],
 ['tell','told','told','The witness ___ us the whole story.','He has never ___ anyone the code.','She telled the police everything.','telled','told','We had not been telled the truth.','telled','told']
];
const verbs=raw.map(x=>({base:x[0],past:x[1],participle:x[2],recallTasks:[{sentence:x[3],target:'past'},{sentence:x[4],target:'participle'}],repairTasks:[{sentence:x[5],wrongForm:x[6],correctForm:x[7]},{sentence:x[8],wrongForm:x[9],correctForm:x[10]}]}));
root.VerbHeistData=verbs;if(typeof module!=='undefined')module.exports=verbs;
})(typeof window!=='undefined'?window:globalThis);
