import React, { forwardRef } from 'react';
import type { ResumeData } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
}

// FIX: Moved Section component definition outside of the ResumePreview component.
// This prevents re-declaration on every render and can resolve complex type inference issues.
const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section>
        <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-1 mb-2 uppercase">{title}</h2>
        {children}
    </section>
);

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data }, ref) => {
    
    const renderDescription = (text: string) => {
        return text.split('\n').map((line, index) => {
            if (line.trim().startsWith('-')) {
                return <li key={index} className="text-sm text-gray-700 ml-4">{line.trim().substring(1).trim()}</li>;
            }
            return <p key={index} className="text-sm text-gray-700 mb-2">{line}</p>;
        });
    };
    
    const sections: { [key: string]: React.ReactNode | null } = {
        summary: data.summary ? (
            <Section title="Summary">
                <p className="text-sm text-gray-700">{data.summary}</p>
            </Section>
        ) : null,
        experience: data.experience.length > 0 && data.experience[0].company ? (
            <Section title="Experience">
                {data.experience.map(exp => (
                    <div key={exp.id} className="mb-4">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-md font-bold text-gray-800">{exp.title}</h3>
                            <p className="text-sm text-gray-600 whitespace-nowrap">{exp.startDate} - {exp.endDate}</p>
                        </div>
                        <p className="text-md italic text-gray-600">{exp.company}</p>
                        <ul className="mt-1 list-disc list-outside">{renderDescription(exp.description)}</ul>
                    </div>
                ))}
            </Section>
        ) : null,
        projects: data.projects.length > 0 && data.projects[0].name ? (
            <Section title="Projects">
                {data.projects.map(proj => (
                    <div key={proj.id} className="mb-4">
                        <h3 className="text-md font-bold text-gray-800">{proj.name}</h3>
                        <p className="text-md italic text-gray-600 mb-1">{proj.role}</p>
                        <p className="text-sm text-gray-700">{proj.description}</p>
                    </div>
                ))}
            </Section>
        ) : null,
        skills: data.skills.length > 0 && data.skills[0].name ? (
            <Section title="Skills">
                <ul className="space-y-1">
                    {data.skills.map(skill => (
                        skill.name && <li key={skill.id} className="text-sm text-gray-700">
                            <span className="font-bold">{skill.name}:</span> {skill.subtypes}
                        </li>
                    ))}
                </ul>
            </Section>
        ) : null,
        education: data.education.length > 0 && data.education[0].institution ? (
            <Section title="Education">
                {data.education.map(edu => (
                    <div key={edu.id} className="mb-2">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-md font-bold text-gray-800">{edu.institution}</h3>
                            <p className="text-sm text-gray-600 whitespace-nowrap">{edu.startDate} - {edu.endDate}</p>
                        </div>
                        <p className="text-md italic text-gray-600">{edu.degree}</p>
                    </div>
                ))}
            </Section>
        ) : null,
        certifications: data.certifications.length > 0 && data.certifications[0].name ? (
            <Section title="Certifications">
                {data.certifications.map(cert => (
                    <div key={cert.id} className="mb-2">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-md font-bold text-gray-800">{cert.name}</h3>
                            <p className="text-sm text-gray-600">{cert.date}</p>
                        </div>
                        <p className="text-md italic text-gray-600">{cert.issuer}</p>
                    </div>
                ))}
            </Section>
        ) : null,
        miscellaneous: data.miscellaneous ? (
            <Section title="Miscellaneous">
                <p className="text-sm text-gray-700">{data.miscellaneous}</p>
            {/* FIX: Corrected closing tag from </section> to </Section> to match the opening component tag. This typo caused cascading parse errors. */}
            </Section>
        ) : null
    };

    const leftColumnKeys: (keyof typeof sections)[] = ['summary', 'experience', 'projects'];
    
    const leftColumnItems: React.ReactNode[] = [];
    const rightColumnItems: React.ReactNode[] = [];

    data.sectionOrder.forEach(key => {
        if (sections[key]) {
            if (leftColumnKeys.includes(key)) {
                leftColumnItems.push(sections[key]);
            } else {
                rightColumnItems.push(sections[key]);
            }
        }
    });

    return (
        <div ref={ref} className="bg-white p-8 shadow-lg w-full">
            {/* Header */}
            <header className="text-center mb-8 border-b-2 border-gray-300 pb-4">
                {data.header.name && <h1 className="text-4xl font-bold text-gray-800 tracking-wider uppercase">{data.header.name}</h1>}
                {data.header.title && <p className="text-lg text-gray-600 mt-1">{data.header.title}</p>}
                <div className="flex justify-center items-center flex-wrap gap-x-4 mt-4 text-xs text-gray-500">
                    {data.header.phone && <span>{data.header.phone}</span>}
                    {data.header.email && <a href={`mailto:${data.header.email}`} className="text-blue-600 hover:underline">{data.header.email}</a>}
                    {data.header.linkedin && <a href={`https://${data.header.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a>}
                    {data.header.website && <a href={`https://${data.header.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Portfolio</a>}
                </div>
            </header>
            
            {/* Main Content */}
            <main className="flex flex-col md:flex-row md:gap-x-4">
                <div className="w-full md:w-[60%] flex-shrink-0">
                    <div className="space-y-6">
                        {leftColumnItems}
                    </div>
                </div>
                <div className="w-full md:w-[38%] flex-shrink-0 mt-6 md:mt-0 pt-6 md:pt-0 md:pl-4">
                    <div className="space-y-6">
                        {rightColumnItems}
                    </div>
                </div>
            </main>
        </div>
    );
});

ResumePreview.displayName = 'ResumePreview';

export { ResumePreview };