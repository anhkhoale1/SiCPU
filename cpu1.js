var MEM; //Mémoire du CPU simulé
var PC;   //Compteur de programme
var PROG;
var DATA;
var prog_current = 0;
var prog_next = 0;
var nbCells = 16;
var data_modifie;
var cond = 0;

// Données d'initialisation de la mémoire du CPU à simuler.
function initPROG()
{
	PROG = 
	[
		402, 402, 3, 
		403, 400, 6,
		402, 403, 9, 
		403, 403, 12, 
		400, 400, 15, 
		403, 401, 18, 
		400, 403, 21,
		403, 403, 24, 
		401, 401, 27,
		403, 402, 30, 
		401, 403, 33,
		403, 403, 36
	];
    
    DATA =
	[
		400,            //Adresse d'implantation des données
		777, 999, 0, 0
	];

    PC = 0;
}

// Initialisation de la mémoire avec les données d'initialisation
function initMEM()
{
	MEM = [];
	initPROG();
	for(var i=0; i<4096; i++)
	{
		MEM.push(0);
	}

	for(var i=0; i<PROG.length; i++)
	{
		MEM[i] = PROG[i];
	}
	MEM[PROG.length] = 4096; //Marqueur de fin de programme

	var offset = DATA[0];
	for(var i=1; i<DATA.length; i++)
	{
		MEM[i+offset-1] = DATA[i];    // 1ere i: 777 -> adresse 400
	}

	prog_current = MEM[2]-1;
	//console.log(prog_current);
	var dest = MEM[PC];
	var src = MEM[PC+1];
	var jmp = MEM[PC+2];
	if(MEM[dest] > MEM[src])
	{
		prog_next = prog_next + 3;
	}
	else
	{
		prog_next = jmp;
	}
}

// Affichage du programme en mémoire
function affProg()
{
    var nbInstr = 16;
    var currentAddr = 0;

    var myTableDiv = document.getElementById("prog");

    var table = document.createElement('TABLE');

    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);

	var inst_current = parseInt(prog_current/3);
	var inst_suivant = prog_next/3;

    for (var i = 0; i < nbInstr; i++) 
    {
        var tr = document.createElement('TR');
        tableBody.appendChild(tr);

		if(i==inst_current) 
		{
			var td = document.createElement('TD');
			td.appendChild(document.createTextNode("=>"));
			tr.appendChild(td);
		}

		if(i!=inst_current) 
		{
			var td = document.createElement('TD');
			td.width = '40';
			tr.appendChild(td);
		}

		if(i==inst_suivant) 
		{
			table.rows[i].style.backgroundColor ="BurlyWood";
		}

        var td = document.createElement('TD');
        td.width = '40';
        td.appendChild(document.createTextNode(i*3 + " "));
        tr.appendChild(td);

        for (var j = 0; j < 3; j++) 
        {
			cond++;
            var td = document.createElement('TD');
			td.setAttribute("id", "PC"+cond);
            td.width = '60';
            td.contentEditable = true;
			td.appendChild(document.createTextNode("" + MEM[currentAddr]));
			tr.appendChild(td);
            currentAddr++;
        }
    }
    myTableDiv.appendChild(table);
}

// Affichage des données en mémoire
function affMem() 
{	
    var startAddr = DATA[0];
    var currentAddr = startAddr;
    
    var myTableDiv = document.getElementById("ram");

    var table = document.createElement('TABLE');

    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);

	var data_change = data_modifie;
	
    for (var i = 0; i < nbCells; i++) 
    {
        var tr = document.createElement('TR');
        tableBody.appendChild(tr);

		if(startAddr+i == data_change)
		{
			table.rows[i].style.backgroundColor ="CadetBlue";
		}

        var td = document.createElement('TD');
        td.width = '40';
        td.appendChild(document.createTextNode(""+ (i+startAddr)));
        tr.appendChild(td);

		var val = MEM[i+startAddr];
		if(val>2047) val = -(4096-val);
        var td = document.createElement('TD');
		td.setAttribute("id", "cell"+currentAddr);
        td.width = '60';
        td.contentEditable = true;
        td.appendChild(document.createTextNode("" + val));
        tr.appendChild(td);
        currentAddr++;
    }
    myTableDiv.appendChild(table);
}

// Simulation de l'exécution d'une isntruction
function steepExec() 
{	
	var startAddr = DATA[0];
	var stock = [];
	var  x;
	var nb_elements = 3*nbCells;

	for(var i=startAddr; i<startAddr+nbCells; i++)
	{
		x = document.getElementById("cell"+i).innerHTML;
		stock[i] = parseInt(x);
	}

	for(var i=startAddr; i<startAddr+nbCells; i++)
	{
		MEM[i]=stock[i];
	}

	
	for(var i=1; i<=nb_elements; i++)
	{	
		x = document.getElementById("PC"+i).innerHTML;
		stock[i-1] = parseInt(x);
	}
	
	for(var i=0; i<nb_elements; i++)
	{
		MEM[i]=stock[i];
	}

	var dest = MEM[PC];
	var src = MEM[PC+1];
	var jmp = MEM[PC+2];
	var dest_next = MEM[PC+3];
	var src_next = MEM[PC+4]
	var jmp_next = MEM[PC+5];

	if(MEM[dest] > MEM[src])
	{
		PC = PC + 3; //  3 = step défault
	}
	else
	{
		PC = jmp;
	}
	prog_current = PC;

	if(MEM[dest_next] > MEM[src_next])
	{
		prog_next = prog_current + 6;
	}
	else
	{
		prog_next = jmp_next ;
	}
		
	if(MEM[dest] >= MEM[src])
	{
		MEM[dest] = MEM[dest] - MEM[src];
	}
	else
	{
		MEM[dest] = 4096 + MEM[dest] - MEM[src];
	}
	
	data_modifie = dest;
	cond = 0;
}

// Action sur le bouton Step qui lance la simulation d'une instruction.
function next() 
{
	steepExec();
    var myTableDiv = document.getElementById("prog");
    myTableDiv.removeChild(myTableDiv.firstChild);
    var myTableDiv = document.getElementById("ram");
    myTableDiv.removeChild(myTableDiv.firstChild);
	affProg();
    affMem();
}

function reset() 
{
    history.go(0);
}

function start()
{
    initMEM();
	affProg();
	affMem();
	//console.log(prog_current+" "+prog_next+" "+data_modifie);
}
