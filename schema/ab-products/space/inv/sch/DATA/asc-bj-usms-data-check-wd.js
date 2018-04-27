View.createController('ascBjUsmsDataCheckWdController', {

    dvCheckPanel_afterRefresh: function(){
        var rows = this.dvCheckPanel.rows;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            row.row.cells.items[4].dom.bgColor = '#fff5d1';
            row.row.cells.items[5].dom.bgColor = '#fff5d1';
            row.row.cells.items[6].dom.bgColor = '#fff5df';
            row.row.cells.items[7].dom.bgColor = '#fff5df';
            row.row.cells.items[8].dom.bgColor = '#fff5d1';
            row.row.cells.items[9].dom.bgColor = '#fff5d1';
            row.row.cells.items[10].dom.bgColor = '#fff5df';
            row.row.cells.items[11].dom.bgColor = '#fff5df';
            row.row.cells.items[12].dom.bgColor = '#fff5d1';
            row.row.cells.items[13].dom.bgColor = '#fff5d1';
        }
    }
});

function checkRm(){
    var checkSelect = $('checkSelectRm').value;
    switch (checkSelect) {
        case 'checkRmType':
            checkRmType()
            break
        case 'checkRmUse':
            checkRmUse()
            break
        case 'checkRmArea':
            checkRmArea()
            break
        case 'checkRmST':
            checkRmST()
            break
        case 'checkRmDv':
            checkRmDv()
            break
        case 'checkCAD':
            checkCAD()
            break
		case 'checkRmName':
		    checkRmName()
			break	
        default:
    }
}

function checkBl(){
    var checkSelect = $('checkSelectBl').value;
    switch (checkSelect) {
        case 'checkBlRmArea':
            checkBlRmArea()
            break
        case 'checkBlArea':
            checkBlArea()
            break
        case 'checkBlDv':
            checkBlDv()
            break
        case 'checkBlDBE':
            checkBlDBE()
            break
        case 'checkBlRm':
            checkBlRm()
            break
        default:
    }
}

function checkEm(){
    var checkSelect = $('checkSelectEm').value;
    switch (checkSelect) {
        case 'checkEmDv':
            checkEmDv()
            break
        case 'checkEmEmail':
            checkEmEmail()
            break
        case 'checkEmRm':
            checkEmRm()
            break
        default:
    }
}

function checkDv(){
    var checkSelect = $('checkSelectDv').value;
    switch (checkSelect) {
        case 'checkDvArea':
            checkDvArea()
            break
        case 'checkDvHead':
            checkDvHead()
            break
        case 'checkDvEm':
            checkDvEm()
            break
        default:
    }
}

function checkUsers(){
    View.panels.get("usersCheckPanel").refresh();
    $('usersSql').innerHTML = "(select user_name,role_name,email from afm_users where  afm_users.email in (select afm_users.email from afm_users group by afm_users.email having count(afm_users.user_name)>1) and afm_users.user_name not in ('AFM','SYSTEM','GUEST'))";
}

function checkRmType(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("rmCheckPanel");
    restriction.addClause('rm.rm_type', null, '=');
    restriction.addClause('rm.rm_cat', null, '=', 'OR');
    $('rmSql').innerHTML = "(rm.rm_type = 'null' OR rm.rm_cat = 'null')";
    View.panels.get("CADCheckPanel").show(false);
    grid.refresh(restriction);
}

function checkRmUse(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("rmCheckPanel");
    restriction.addClause('rm.rm_use', '', 'IS NULL');
    $('rmSql').innerHTML = "(rm.rm_use IS NULL ) ";
    View.panels.get("CADCheckPanel").show(false);
    grid.refresh(restriction);
}

function checkRmArea(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("rmCheckPanel");
    //restriction.addClause('rm.area',0, '<=');
    restriction.addClause('rm.area_manual', 0, '<=');
    $('rmSql').innerHTML = "(rm.area_manual <= 0.0)";
    View.panels.get("CADCheckPanel").show(false);
    grid.refresh(restriction);
}

/**
 * 检查房间名称不能为空
 */
function checkRmName(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("rmCheckPanel");
    restriction.addClause('rm.name', '', 'IS NULL');
    
    $('rmSql').innerHTML = "(rm.name IS NULL ) ";
    View.panels.get("CADCheckPanel").show(false);
    grid.refresh(restriction);
}

function checkRmST(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("rmCheckPanel");
    restriction.addClause('rm.rm_cat', 'SERV', '=');
    restriction.addClause('rm.dv_id', '无', '<>');
    restriction.addClause('rm.rm_cat', 'SERV', '<>', ')OR(');
    restriction.addClause('rm.dv_id', '无', '=');
    $('rmSql').innerHTML = "(rm.rm_cat = 'SERV' AND rm.dv_id <> '无' )OR( rm.rm_cat <> 'SERV' AND rm.dv_id = '无')";
    View.panels.get("CADCheckPanel").show(false);
    grid.refresh(restriction);
}

function checkRmDv(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("rmCheckPanel");
    restriction.addClause('rm.dv_id', null, '=');
    $('rmSql').innerHTML = "(rm.dv_id = 'null')";
    View.panels.get("CADCheckPanel").show(false);
    grid.refresh(restriction);
}

function checkRmDv1(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("rmCheckPanel");
    restriction.addClause('rm.dv_id', '学校', '!=','AND');
	restriction.addClause('rm.rm_cat', 'SERV', '=');
    $('rmSql').innerHTML = "(rm.dv_id != '学校' AND rm.rm_cat='SERV')";
    View.panels.get("CADCheckPanel").show(false);
    grid.refresh(restriction);
}

function checkCAD(){
    var grid = View.panels.get("CADCheckPanel");
    $('rmSql').innerHTML = "select count(distinct rm.dwgname),rm.bl_id,rm.fl_id from rm,fl where rm.bl_id = fl.bl_id and rm.fl_id=fl.fl_id having count(distinct rm.dwgname) > 1 group by rm.bl_id,rm.fl_id";
    View.panels.get("rmCheckPanel").show(false);
    grid.refresh();
}

function checkBlRmArea(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("blCheckPanel");
    restriction.addClause('bl.area_rm', 0, '<=');
    restriction.addClause('bl.area_building_manual', 0, '<=', 'OR');
    $('blSql').innerHTML = "(bl.area_rm <= 0.0 OR bl.area_building_manual <= 0.0)";
    grid.refresh(restriction);
}

function checkBlArea(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("blCheckPanel");
    restriction.addClause('bl.area_building_manual', 'bl.area_rm', '<');
    $('blSql').innerHTML = "(bl.area_building_manual < bl.area_rm)";
    grid.refresh(restriction);
}

function checkBlDv(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("blCheckPanel");
    restriction.addClause('bl.building_cat', '', 'IS NULL');
    restriction.addClause('bl.dv_use', '', 'IS NOT NULL');
    restriction.addClause('bl.building_cat', '', 'IS NOT NULL', ')OR(');
    restriction.addClause('bl.dv_use', '', 'IS NULL');
    $('blSql').innerHTML = "(bl.building_cat IS NULL  AND bl.dv_use IS NOT NULL  )OR( bl.building_cat IS NOT NULL  AND bl.dv_use IS NULL )";
    grid.refresh(restriction);
}

function checkBlDBE(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("blCheckPanel");
    restriction.addClause('bl.date_building_end', '', 'IS NULL', ')OR(');
    restriction.addClause('bl.date_use', '', 'IS NULL')
    $('blSql').innerHTML = "(bl.date_building_end IS NULL OR bl.date_use IS NULL )";
    grid.refresh(restriction);
}

function checkBlRm(){
    var grid = View.panels.get("blCheckPanel");
    var restriction = "";
    restriction += "((EXISTS(select 1 from rm where bl.bl_id = rm.bl_id) or(exists( select 1 from sc_bl_rmcat where bl.bl_id = sc_bl_rmcat.bl_id )))and (building_cat is not null or dv_use is not null))";
    restriction += " and (((building_cat is null or dv_use is null)) and (NOT EXISTS(select 1 from rm where bl.bl_id = rm.bl_id)) and (not exists( select 1 from sc_bl_rmcat where bl.bl_id = sc_bl_rmcat.bl_id )))  ";
    $('blSql').innerHTML = restriction;
    grid.refresh(restriction);
}

function checkEmEmail(){
    var grid = View.panels.get("emCheckPanel");
    var restriction = "(em.email in (select em.email from em group by em.email having count(em.em_id)>1))";
    View.panels.get("emRmCheckPanel").show(false);
    $('emSql').innerHTML = restriction;
    grid.refresh(restriction);
}

function checkEmRm(){
    View.panels.get("emCheckPanel").show(false);
    View.panels.get("emRmCheckPanel").refresh();
    $('emSql').innerHTML = "(select rm.bl_id,rm.dv_id as rm_dv,rm.rm_id,em.em_id,em.name,em.dv_id as em_dv from em,rm where em.bl_id=rm.bl_id and em.fl_id=rm.fl_id and em.rm_id=rm.rm_id and em.dv_id != rm.dv_id)";
}

function checkEmDv(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("emCheckPanel");
    restriction.addClause('em.dv_id', '', 'IS NULL');
    View.panels.get("emRmCheckPanel").show(false);
    $('emSql').innerHTML = "(em.dv_id IS NULL )";
    grid.refresh(restriction);
}

function checkDvArea(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("dvCheckPanel");
    restriction.addClause('dv.area_rm', 'dv.area_jianzhu', '>');
    $('dvSql').innerHTML = "(dv.area_rm > dv.area_jianzhu)";
    grid.refresh(restriction);
}

function checkDvHead(){
    var restriction = new Ab.view.Restriction();
    var grid = View.panels.get("dvCheckPanel");
    restriction.addClause('dv.head', '', 'IS NULL');
    $('dvSql').innerHTML = "(dv.head IS NULL )";
    grid.refresh(restriction);
}

function checkDvEm(){
    var restriction = new Ab.view.Restriction();
    restriction.addClause('dv.count_em', "(select count(em.em_id) from em,dv where em.emp_classification in ('JS','GL','GR','ZJ') and em.dv_id = dv.dv_id)", '<>', 'OR');
    restriction.addClause('dv.count_teacher', "(select count(em.em_id) from em,dv where em.emp_classification ='JS' and em.dv_id = dv.dv_id)", '<>', 'OR');
    restriction.addClause('dv.count_ganbu', "(select count(em.em_id) from em,dv where em.emp_classification ='GL' and em.dv_id = dv.dv_id)", '<>', 'OR');
    restriction.addClause('dv.count_gongren', "(select count(em.em_id) from em,dv where em.emp_classification ='GR' and em.dv_id = dv.dv_id)", '<>', 'OR');
    restriction.addClause('dv.count_zhuanji', "(select count(em.em_id) from em,dv where em.emp_classification ='ZJ' and em.dv_id = dv.dv_id)", '<>', 'OR');
    var grid = View.panels.get("dvCheckPanel");
    $('dvSql').innerHTML = "(dv.count_em <> (select count(em.em_id) from em,dv where em.emp_classification in ('JS','GL','GR','ZJ') and em.dv_id = dv.dv_id) OR dv.count_teacher <> (select count(em.em_id) from em,dv where em.emp_classification ='JS' and em.dv_id = dv.dv_id) OR dv.count_ganbu <> (select count(em.em_id) from em,dv where em.emp_classification ='GL' and em.dv_id = dv.dv_id) OR dv.count_gongren <> (select count(em.em_id) from em,dv where em.emp_classification ='GR' and em.dv_id = dv.dv_id) OR dv.count_zhuanji <> (select count(em.em_id) from em,dv where em.emp_classification ='ZJ' and em.dv_id = dv.dv_id))";
    grid.refresh(restriction);
}
