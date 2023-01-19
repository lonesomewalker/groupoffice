
import {notebookcombo} from "./NoteBookCombo.js";
import {cardmenu} from "@goui/component/CardMenu.js";
import {CardContainer, cards} from "@goui/component/CardContainer.js";
import {containerfield} from "@goui/component/form/ContainerField.js";
import {form, Form} from "@goui/component/form/Form.js";
import {Fieldset, fieldset} from "@goui/component/form/Fieldset.js";
import {textfield} from "@goui/component/form/TextField.js";
import {tbar} from "@goui/component/Toolbar.js";
import {t} from "@goui/Translate.js";
import {root} from "@goui/component/Root.js";
import {client} from "@goui/jmap/Client.js";
import {htmlfield} from "@goui/component/form/HtmlField.js";
import {EntityStore} from "@goui/jmap/EntityStore.js";
import {btn} from "@goui/component/Button.js";
import {Window} from "@goui/component/Window.js";
import {Notifier} from "@goui/Notifier.js";
import {comp} from "@goui/component/Component.js";

export class NoteDialog extends Window {
	readonly form: Form;
	private entityStore: EntityStore;
	private currentId?: number;
	private cards: CardContainer;
	private general: Fieldset;

	constructor() {
		super();

		this.entityStore = new EntityStore("Note", client);

		this.cls = "vbox";
		this.title = t("Note");
		this.width = 600;
		this.height = 400;
		this.stateId = "note-dialog";
		this.maximizable = true;

		this.items.add(
			this.form = form(
				{
					cls: "vbox",
					flex: 1,
					handler: async (form) => {
						try {
							await this.entityStore.save(form.value, this.currentId);
							this.close();
						} catch (e) {
							Window.alert(t("Error"), e);
						} finally {
							this.unmask();
						}
					}
				},
				cardmenu(),

				this.cards = cards({flex: 1},
					this.general = fieldset({cls: "scroll fit", title: t("General")},



						comp({cls: "hbox gap"},
							textfield({
								flex: 2,
								name: "name",
								label: t("Name"),
								required: true
							}),

							notebookcombo({
								flex: 1
							}),
						),

						htmlfield({
							name: "content",
							listeners: {

								insertimage: (htmlfield, file, img) => {
									root.mask();

									client.upload(file).then(r => {
										if (img) {
											img.dataset.blobId = r.blobId;
											img.removeAttribute("id");
										}
										Notifier.success("Uploaded " + file.name + " successfully");
									}).catch((err) => {
										console.error(err);
										Notifier.error("Failed to upload " + file.name);
									}).finally(() => {
										root.unmask();
									});
								}
							}
						}),



					)
				),


				tbar({cls: "border-top"},
					"->",
					btn({
						type: "submit",
						text: t("Save")
					})
				)
			)
		)

		this.addCustomFields();
	}

	public async load(id: number) {

		this.mask();

		try {
			this.form.value = await this.entityStore.single(id);
			this.currentId = id;
		} catch (e) {
			Window.alert(t("Error"), e + "");
		} finally {
			this.unmask();
		}

		return this;
	}


	private addCustomFields() {
		const es = "Note"
		if (go.Entities.get(es).customFields) {
			const fieldsets = go.customfields.CustomFields.getFormFieldSets(es);
			fieldsets.forEach((fs: any) => {

				//replace customFields. because we will use a containerfield here.
				fs.cascade((item: any) => {
					if (item.getName) {
						let fieldName = item.getName().replace('customFields.', '');
						item.name = item.hiddenName =  fieldName;
					}
				});

				if (fs.fieldSet.isTab) {
					fs.title = null;
					fs.collapsible = false;

					this.cards.items.add(containerfield({name: "customFields", cls: "scroll", title: fs.fieldSet.name}, fs));
				} else {
					//in case formPanelLayout is set to column
					fs.columnWidth = 1;
					this.general.items.add(containerfield({name: "customFields"}, fs));
				}
			}, this);
		}
	}
}