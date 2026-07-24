"use client";

import ProfileCard from "./ProfileCard";
import ProfileEdit from "./ProfileEdit";

export default function ProfileSection({
  profile,
  form,
  setForm,
  editing,
  aboutForm,
  setAboutForm,
  experiences,
  setExperiences,
  educations,
  setEducations,
  isGraduate,
  editSection,
  setEditSection,
  expForm,
  setExpForm,
  eduForm,
  setEduForm,
  skills,
  onAddSkill,
  onDeleteSkill,
  skillInput,
  setSkillInput,
  saveExpToFirebase,
  saveEduToFirebase,
}) {
  if (!editing) {
    return <ProfileCard profile={profile} />;
  }

  return (
    <ProfileEdit
      form={form}
      setForm={setForm}
      aboutForm={aboutForm}
      setAboutForm={setAboutForm}
      experiences={experiences}
      educations={educations}
      isGraduate={isGraduate}
      editSection={editSection}
      setEditSection={setEditSection}
      expForm={expForm}
      setExpForm={setExpForm}
      eduForm={eduForm}
      setEduForm={setEduForm}
      skills={skills}
      onAddSkill={onAddSkill}
      onDeleteSkill={onDeleteSkill}
      skillInput={skillInput}
      setSkillInput={setSkillInput}
      saveExpToFirebase={saveExpToFirebase}
      saveEduToFirebase={saveEduToFirebase}
    />
  );
}