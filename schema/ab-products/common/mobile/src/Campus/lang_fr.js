//Ext.ns('Mobile.language');

var Mobile = Mobile || {};

Mobile.language = Mobile.language || {};

Mobile.language.fr = {

    localizedStrings: {
        'Equipment' : 'Equipment',
        'Email' : 'Email',
        'Username' : "Nom d'utilisateur",
        'Password' : 'Mot de passe',

        'Select ARCHIBUS Mobile Smart Client Application' : 'Select ARCHIBUS Mobile Smart Client Application',
        'Enter your ARCHIBUS user name' : "Entrez votre nom d'utilisateur ARCHIBUS",
        'Enter your ARCHIBUS password' : 'Entrez votre mot de passe ARCHIBUS',
        'ARCHIBUS Mobile Smart Client Registration' : 'Enregistrement Mobile Client intelligent ARCHIBUS',
        'Select Work Request' : 'Select Work Request',
        'Download Validating Tables' : 'Download Validating Tables',

        'OK': 'Bien',
        'Back': 'Précédent'
    },

    // Number formatting
    groupingSeparator: ' ',
    decimalSeparator: ',',

    dayNames:[
        'dimanche',
        'lundi',
        'mardi',
        'mercredi',
        'jeudi',
        'vendredi',
        'samedi'
    ],

    monthNames:[
        'Janvier',
        'Fevrier',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Aout',
        'Septembre',
        'Octobre',
        'Novembre',
        'Decembre'
    ],

    monthNumbers:{
        'Jan':0,
        'Feb':1,
        'Mar':2,
        'Apr':3,
        'May':4,
        'Jun':5,
        'Jul':6,
        'Aug':7,
        'Sep':8,
        'Oct':9,
        'Nov':10,
        'Dec':11
    },

    defaultDateFormat:'d/m/Y',

    letters:['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],

    dayText:'Day',
    monthText:'Month',
    yearText:'Year',
    slotOrder:['month', 'day', 'year'],

    doneText:'Done',

    backText:'Précédent',
    loadingText:'Chargement...',
    emptyText:'Aucun élément disponible',

    msgBoxOK: 'Bien',
    msgBoxCancel: 'Annuler',
    msgBoxYes: 'Oui',
    msgBoxNo: 'Non'

};